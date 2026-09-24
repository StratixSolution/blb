import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();
    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, (code as string).toUpperCase().trim()))
      .limit(1);

    if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    if (!coupon.active) return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

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
