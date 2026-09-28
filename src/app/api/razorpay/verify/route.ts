import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createOrderFromPending } from "@/lib/createOrderFromPending";
import { sendOrderConfirmation } from "@/lib/sendOrderConfirmation";

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
