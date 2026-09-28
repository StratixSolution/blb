import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db/client";
import { pendingOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createOrderFromPending, CustomerData, AttributionData } from "@/lib/createOrderFromPending";

// Razorpay sends raw body for signature verification - must read as text
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("Webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload: { payment: { entity: { id: string; order_id: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("Razorpay webhook received:", event.event);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;

    console.log("Processing payment.captured", { razorpayOrderId, razorpayPaymentId });

    // Load customer data stored at order creation time
    const [pending] = await db.select().from(pendingOrders).where(eq(pendingOrders.id, razorpayOrderId)).limit(1);

    if (!pending) {
      // Already processed or unknown order - acknowledge anyway
      console.log("Pending order not found, may be already processed:", razorpayOrderId);
      return NextResponse.json({ ok: true });
    }

    let customer: CustomerData | null = null;
    let attribution: AttributionData | null = null;

    if (pending.customerJson) {
      try {
        customer = JSON.parse(pending.customerJson) as CustomerData;
      } catch {
        console.error("Failed to parse customerJson for order", razorpayOrderId);
      }
    }

    if (pending.attributionJson) {
      try {
        attribution = JSON.parse(pending.attributionJson) as AttributionData;
      } catch { /* ignore */ }
    }

    if (!customer) {
      console.error("No customer data for order", razorpayOrderId, "- cannot create order via webhook");
      return NextResponse.json({ ok: true });
    }

    const result = await createOrderFromPending(razorpayOrderId, razorpayPaymentId, customer, attribution);
    if (result.success) {
      console.log("Order created via webhook:", result.orderNumber);
    } else {
      console.error("Webhook order creation failed:", result.error);
    }
  }

  // Always return 200 to Razorpay to acknowledge receipt
  return NextResponse.json({ ok: true });
}
