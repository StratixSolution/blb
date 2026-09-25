import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "@/db/client";
import { orders, orderItems, customers, coupons, pendingOrders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { esc } from "@/lib/htmlEscape";
import { generateOrderNumber } from "@/lib/orderNumber";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Load server-side computed order snapshot
    const [pending] = await db
      .select()
      .from(pendingOrders)
      .where(eq(pendingOrders.id, razorpay_order_id))
      .limit(1);

    if (!pending) {
      return NextResponse.json({ error: "Order session expired. Please start a new checkout." }, { status: 400 });
    }

    const lineItems: Array<{ productId: number; productName: string; price: number; quantity: number }> =
      JSON.parse(pending.itemsJson);
    const total = pending.amountPaise / 100;
    const appliedDiscount = pending.discount;
    const couponCode = pending.couponCode;

    const orderNumber = await generateOrderNumber();

    await db.insert(orders).values({
      id: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "pending",
      orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone ?? "",
      address: customer.address,
      city: customer.city,
      state: customer.state ?? "",
      pincode: customer.pincode,
      total,
      discount: appliedDiscount,
      couponCode: couponCode ?? null,
    });

    await db.insert(orderItems).values(
      lineItems.map((i) => ({
        orderId: razorpay_order_id,
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

    const now = new Date().toISOString();
    if (existing.length > 0) {
      await db
        .update(customers)
        .set({
          orderCount: sql`${customers.orderCount} + 1`,
          totalSpend: sql`${customers.totalSpend} + ${total}`,
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
        totalSpend: total,
        lastOrderAt: now,
      });
    }

    if (couponCode) {
      await db
        .update(coupons)
        .set({ usesCount: sql`${coupons.usesCount} + 1` })
        .where(eq(coupons.code, couponCode));
    }

    // Clean up pending order
    await db.delete(pendingOrders).where(eq(pendingOrders.id, razorpay_order_id));

    sendOrderConfirmation({ customer, lineItems, orderId: razorpay_order_id, orderNumber, paymentId: razorpay_payment_id })
      .catch((err) => console.error("Order confirmation email failed (order saved):", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

async function sendOrderConfirmation({
  customer,
  lineItems,
  orderId,
  orderNumber,
  paymentId,
}: {
  customer: { name: string; email: string; address: string; city: string; pincode: string };
  lineItems: Array<{ productName: string; price: number; quantity: number }>;
  orderId: string;
  orderNumber: string;
  paymentId: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const total = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemLines = lineItems
    .map((i) => `${i.productName} x${i.quantity} - ₹${i.price * i.quantity}`)
    .join("\n");

  await transporter.sendMail({
    from: `"Bean Leaf Brew" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: customer.email,
    bcc: process.env.ADMIN_EMAIL,
    subject: `Order Confirmed - Bean Leaf Brew ${orderNumber}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1A0E08;">
        <div style="background: #1A0E08; padding: 24px; text-align: center;">
          <h1 style="color: #F7F0E6; margin: 0; font-size: 24px;">Bean Leaf Brew</h1>
        </div>
        <div style="padding: 32px; background: #F7F0E6;">
          <h2 style="color: #4A2512;">Order Confirmed!</h2>
          <p>Hi ${esc(customer.name)}, thank you for your order.</p>
          <p style="color: #8B5E3C; font-size: 13px;">Order: ${esc(orderNumber)}</p>
          <div style="background: #EAD9C8; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Items Ordered</h3>
            <pre style="font-family: inherit; white-space: pre-wrap;">${esc(itemLines)}</pre>
            <strong>Total: ₹${total}</strong>
          </div>
          <p><strong>Delivery to:</strong><br/>${esc(customer.address)}, ${esc(customer.city)} ${esc(customer.pincode)}</p>
          <p style="color: #8B5E3C; font-size: 13px;">Payment ID: ${esc(paymentId)}</p>
          <p>We'll ship your order within 1-2 business days. Anywhere. Anytime.</p>
          <p style="color: #C9953C;">— Team Bean Leaf Brew</p>
        </div>
      </div>`,
    text: `Order confirmed!\n\n${itemLines}\n\nTotal: ₹${total}\n\nDelivery to: ${customer.address}, ${customer.city}`,
  });
}
