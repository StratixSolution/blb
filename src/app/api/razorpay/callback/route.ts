import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db/client";
import { pendingOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createOrderFromPending, CustomerData, AttributionData } from "@/lib/createOrderFromPending";
import { sendOrderConfirmation } from "@/lib/sendOrderConfirmation";

// Razorpay POSTs form data here after UPI/payment redirect flow
export async function POST(req: NextRequest) {
  const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  try {
    const formData = await req.formData();
    const razorpay_payment_id = formData.get("razorpay_payment_id") as string | null;
    const razorpay_order_id = formData.get("razorpay_order_id") as string | null;
    const razorpay_signature = formData.get("razorpay_signature") as string | null;

    console.log("=== CALLBACK CALLED ===", { razorpay_order_id, razorpay_payment_id });

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error("Callback missing params");
      return NextResponse.redirect(`${origin}/checkout?error=payment_failed`);
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Callback signature mismatch", { razorpay_order_id });
      return NextResponse.redirect(`${origin}/checkout?error=payment_failed`);
    }

    const [pending] = await db.select().from(pendingOrders).where(eq(pendingOrders.id, razorpay_order_id)).limit(1);

    if (!pending) {
      // Already processed (likely by webhook) - go straight to success
      console.log("Callback: pending order not found, assuming already processed:", razorpay_order_id);
      return NextResponse.redirect(`${origin}/checkout/success`);
    }

    let customer: CustomerData | null = null;
    let attribution: AttributionData | null = null;

    if (pending.customerJson) {
      try {
        customer = JSON.parse(pending.customerJson) as CustomerData;
      } catch {
        console.error("Callback: failed to parse customerJson for", razorpay_order_id);
      }
    }

    if (pending.attributionJson) {
      try {
        attribution = JSON.parse(pending.attributionJson) as AttributionData;
      } catch { /* ignore */ }
    }

    if (!customer) {
      console.error("Callback: no customer data for order", razorpay_order_id);
      return NextResponse.redirect(`${origin}/checkout/success`);
    }

    const result = await createOrderFromPending(razorpay_order_id, razorpay_payment_id, customer, attribution);

    if (result.success) {
      console.log("Callback: order created:", result.orderNumber);
      sendOrderConfirmation({ customer, orderId: razorpay_order_id, orderNumber: result.orderNumber, paymentId: razorpay_payment_id })
        .catch((err) => console.error("Callback email failed (order saved):", err));
    } else {
      console.error("Callback: createOrderFromPending failed:", result.error);
    }

    return NextResponse.redirect(`${origin}/checkout/success`);
  } catch (error) {
    console.error("Razorpay callback error:", error);
    return NextResponse.redirect(`${origin}/checkout/success`);
  }
}
