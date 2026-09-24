import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

const INVALID = NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();
    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, (code as string).toUpperCase().trim()))
      .limit(1);

    if (!coupon) return INVALID;
    if (!coupon.active) return INVALID;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return INVALID;
    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) return INVALID;

    if (cartTotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${coupon.minOrderAmount} required` },
        { status: 400 }
      );
    }

    const discount =
      coupon.type === "percentage"
        ? Math.round((cartTotal * coupon.amount) / 100)
        : Math.min(coupon.amount, cartTotal);

    return NextResponse.json({
      valid: true,
      discount,
      type: coupon.type,
      amount: coupon.amount,
      code: coupon.code,
    });
  } catch {
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
