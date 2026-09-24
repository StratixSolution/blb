import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/db/client";
import { orders, orderItems, customers, coupons, products } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { esc } from "@/lib/htmlEscape";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, couponCode } = body as {
      customer: { name: string; email: string; phone?: string; address: string; city: string; state?: string; pincode: string };
      items: Array<{ productId: number; quantity: number }>;
      couponCode?: string | null;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Look up prices from DB
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    const lineItems: Array<{ productId: number; productName: string; price: number; quantity: number }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
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

      if (!couponValid) {
        return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
      }

      discount =
        coupon.type === "percentage"
          ? Math.round((subtotal * coupon.amount) / 100)
          : Math.min(coupon.amount, subtotal);
      validatedCouponCode = coupon.code;
    }

    const total = Math.max(0, subtotal - discount);
    if (total > 0) {
      return NextResponse.json({ error: "Order is not free" }, { status: 400 });
    }

    const orderId = `free_${Date.now()}`;
    const paymentId = `coupon_${validatedCouponCode ?? "free"}`;
    const now = new Date().toISOString();

    await db.insert(orders).values({
      id: orderId,
      paymentId,
      status: "processing",
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone ?? "",
      address: customer.address,
      city: customer.city,
      state: customer.state ?? "",
      pincode: customer.pincode,
      total: 0,
      discount,
      couponCode: validatedCouponCode,
    });

    await db.insert(orderItems).values(
      lineItems.map((i) => ({
        orderId,
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        quantity: i.quantity,
      }))
    );

    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.email, customer.email))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(customers)
        .set({
          orderCount: sql`${customers.orderCount} + 1`,
          totalSpend: sql`${customers.totalSpend} + 0`,
          address: customer.address,
          city: customer.city,
          state: customer.state ?? "",
          pincode: customer.pincode,
          lastOrderAt: now,
        })
        .where(eq(customers.email, customer.email));
    } else {
      await db.insert(customers).values({
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? "",
        address: customer.address,
        city: customer.city,
        state: customer.state ?? "",
        pincode: customer.pincode,
        orderCount: 1,
        totalSpend: 0,
        lastOrderAt: now,
      });
    }

    if (validatedCouponCode) {
      await db
        .update(coupons)
        .set({ usesCount: sql`${coupons.usesCount} + 1` })
        .where(eq(coupons.code, validatedCouponCode));
    }

    sendOrderConfirmation({ customer, lineItems, orderId, paymentId, discount })
      .catch((err) => console.error("Order confirmation email failed (order saved):", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Free order error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

async function sendOrderConfirmation({
  customer,
  lineItems,
  orderId,
  paymentId,
  discount,
}: {
  customer: { name: string; email: string; address: string; city: string; pincode: string };
  lineItems: Array<{ productName: string; price: number; quantity: number }>;
  orderId: string;
  paymentId: string;
  discount: number;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemLines = lineItems
    .map((i) => `${i.productName} x${i.quantity} - ₹${i.price * i.quantity}`)
    .join("\n");

  await transporter.sendMail({
    from: `"Bean Leaf Brew" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: customer.email,
    bcc: process.env.ADMIN_EMAIL,
    subject: `Order Confirmed - Bean Leaf Brew #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1A0E08;">
        <div style="background: #1A0E08; padding: 24px; text-align: center;">
          <h1 style="color: #F7F0E6; margin: 0; font-size: 24px;">Bean Leaf Brew</h1>
        </div>
        <div style="padding: 32px; background: #F7F0E6;">
          <h2 style="color: #4A2512;">Order Confirmed!</h2>
          <p>Hi ${esc(customer.name)}, thank you for your order.</p>
          <p style="color: #8B5E3C; font-size: 13px;">Order ID: ${esc(orderId)}</p>
          <div style="background: #EAD9C8; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Items Ordered</h3>
            <pre style="font-family: inherit; white-space: pre-wrap;">${esc(itemLines)}</pre>
            <p>Subtotal: ₹${subtotal}</p>
            <p>Discount: -₹${discount}</p>
            <strong>Total: ₹0 (fully covered by coupon)</strong>
          </div>
          <p><strong>Delivery to:</strong><br/>${esc(customer.address)}, ${esc(customer.city)} ${esc(customer.pincode)}</p>
          <p style="color: #8B5E3C; font-size: 13px;">Payment ID: ${esc(paymentId)}</p>
          <p>We'll ship your order within 1-2 business days. Anywhere. Anytime.</p>
          <p style="color: #C9953C;">— Team Bean Leaf Brew</p>
        </div>
      </div>`,
    text: `Order confirmed!\n\n${itemLines}\n\nSubtotal: ₹${subtotal}\nDiscount: -₹${discount}\nTotal: ₹0\n\nDelivery to: ${customer.address}, ${customer.city}`,
  });
}
