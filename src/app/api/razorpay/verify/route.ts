import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createOrderFromPending } from "@/lib/createOrderFromPending";
import { esc } from "@/lib/htmlEscape";

export async function POST(req: NextRequest) {
  console.log("=== VERIFY CALLED ===", new Date().toISOString());
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer, attribution } = body;
    console.log("Body parsed", { razorpay_order_id, razorpay_payment_id, has_customer: !!customer, has_sig: !!razorpay_signature });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing fields", { razorpay_order_id, razorpay_payment_id, razorpay_signature: !!razorpay_signature });
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch", { razorpay_order_id, razorpay_payment_id });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Signature verified, creating order", { razorpay_order_id });

    const result = await createOrderFromPending(razorpay_order_id, razorpay_payment_id, customer, attribution);

    if (!result.success) {
      console.error("createOrderFromPending failed", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    sendOrderConfirmation({ customer, orderId: razorpay_order_id, orderNumber: result.orderNumber, paymentId: razorpay_payment_id })
      .catch((err) => console.error("Order confirmation email failed (order saved):", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

async function sendOrderConfirmation({
  customer,
  orderId,
  orderNumber,
  paymentId,
}: {
  customer: { name: string; email: string; address: string; city: string; pincode: string };
  orderId: string;
  orderNumber: string;
  paymentId: string;
}) {
  // Get line items from the order
  const { db } = await import("@/db/client");
  const { orderItems } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const lineItems = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

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
    from: process.env.SMTP_FROM ?? `"Bean Leaf Brew" <${process.env.SMTP_USER}>`,
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
