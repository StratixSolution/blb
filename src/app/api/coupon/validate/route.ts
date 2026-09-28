import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rateLimit";

const INVALID = NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`coupon:${ip}`, 20, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

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
    if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its maximum usage limit" }, { status: 400 });
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
        : coupon.type === "flat_total"
          ? Math.max(0, cartTotal - coupon.amount)
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
