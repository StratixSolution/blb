import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/db/client";
import { orders, orderItems, customers, coupons } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, couponCode, discount } = body;

    const subtotal = items.reduce(
      (sum: number, i: { product: { price: number }; quantity: number }) =>
        sum + i.product.price * i.quantity,
      0
    );
    const appliedDiscount = Number(discount ?? 0);
    const total = Math.max(0, subtotal - appliedDiscount);

    if (total > 0) {
      return NextResponse.json({ error: "Order is not free" }, { status: 400 });
    }

    const orderId = `free_${Date.now()}`;
    const paymentId = `coupon_${couponCode ?? "free"}`;
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
      discount: appliedDiscount,
      couponCode: couponCode ?? null,
    });

    await db.insert(orderItems).values(
      items.map((i: { product: { id: number; name: string; price: number }; quantity: number }) => ({
        orderId,
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
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

    if (couponCode) {
      await db
        .update(coupons)
        .set({ usesCount: sql`${coupons.usesCount} + 1` })
        .where(eq(coupons.code, couponCode));
    }

    sendOrderConfirmation({ customer, items, orderId, paymentId, discount: appliedDiscount })
      .catch((err) => console.error("Order confirmation email failed (order saved):", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Free order error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

async function sendOrderConfirmation({
  customer,
  items,
  orderId,
  paymentId,
  discount,
}: {
  customer: { name: string; email: string; address: string; city: string; pincode: string };
  items: Array<{ product: { name: string; price: number }; quantity: number }>;
  orderId: string;
  paymentId: string;
  discount: number;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemLines = items
    .map((i) => `${i.product.name} x${i.quantity} - ₹${i.product.price * i.quantity}`)
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
          <p>Hi ${customer.name}, thank you for your order.</p>
          <p style="color: #8B5E3C; font-size: 13px;">Order ID: ${orderId}</p>
          <div style="background: #EAD9C8; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Items Ordered</h3>
            <pre style="font-family: inherit; white-space: pre-wrap;">${itemLines}</pre>
            <p>Subtotal: ₹${subtotal}</p>
            <p>Discount: -₹${discount}</p>
            <strong>Total: ₹0 (fully covered by coupon)</strong>
          </div>
          <p><strong>Delivery to:</strong><br/>${customer.address}, ${customer.city} ${customer.pincode}</p>
          <p style="color: #8B5E3C; font-size: 13px;">Payment ID: ${paymentId}</p>
          <p>We'll ship your order within 1-2 business days. Anywhere. Anytime.</p>
          <p style="color: #C9953C;">— Team Bean Leaf Brew</p>
        </div>
      </div>`,
    text: `Order confirmed!\n\n${itemLines}\n\nSubtotal: ₹${subtotal}\nDiscount: -₹${discount}\nTotal: ₹0\n\nDelivery to: ${customer.address}, ${customer.city}`,
  });
}
