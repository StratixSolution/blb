import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db/client";
import { products, coupons, pendingOrders } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, couponCode } = body as {
      items: Array<{ productId: number; quantity: number }>;
      couponCode?: string | null;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Look up all product prices from the database
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems: Array<{ productId: number; productName: string; price: number; quantity: number }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (!product.inStock) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
      }
      const qty = Math.max(1, Math.floor(item.quantity));
      subtotal += product.price * qty;
      lineItems.push({ productId: product.id, productName: product.name, price: product.price, quantity: qty });
    }

    // Validate coupon server-side
    let discount = 0;
    let validatedCouponCode: string | null = null;

    if (couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode.toUpperCase().trim()))
        .limit(1);

      const couponValid =
        coupon &&
        coupon.active &&
        !(coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) &&
        !(coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) &&
        subtotal >= coupon.minOrderAmount;

      if (couponValid) {
        discount =
          coupon.type === "percentage"
            ? Math.round((subtotal * coupon.amount) / 100)
            : Math.min(coupon.amount, subtotal);
        validatedCouponCode = coupon.code;
      }
    }

    const total = Math.max(0, subtotal - discount);

    if (total === 0) {
      return NextResponse.json({ free: true, discount, couponCode: validatedCouponCode, lineItems });
    }

    const amountPaise = Math.round(total * 100);
    if (amountPaise < 100) {
      return NextResponse.json({ error: "Order total must be at least ₹1" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `blb_${Date.now()}`,
    });

    // Store the server-side computed order snapshot
    await db.insert(pendingOrders).values({
      id: order.id as string,
      amountPaise,
      discount,
      couponCode: validatedCouponCode,
      itemsJson: JSON.stringify(lineItems),
    });

    return NextResponse.json({ id: order.id, amount: amountPaise });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
