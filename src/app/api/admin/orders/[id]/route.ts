import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { orders, orderItems, orderNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { esc } from "@/lib/htmlEscape";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  const body = await req.json();
  const { status, trackingRef, trackingVendor, invoiceNumber, note, noteType } = body;

  const ALLOWED_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (status && !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (note?.trim()) {
    await db.insert(orderNotes).values({
      orderId: id,
      note: note.trim(),
      type: noteType === "customer" ? "customer" : "internal",
    });
  }

  if (status || trackingRef !== undefined || trackingVendor !== undefined || invoiceNumber !== undefined) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (trackingRef !== undefined) updates.trackingRef = trackingRef || null;
    if (trackingVendor !== undefined) updates.trackingVendor = trackingVendor || null;
    if (invoiceNumber !== undefined) updates.invoiceNumber = invoiceNumber?.trim() || null;

    await db.update(orders).set(updates).where(eq(orders.id, id));

    if (status === "shipped" && order.status !== "shipped") {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
      const customerNotes = await db.select().from(orderNotes).where(eq(orderNotes.orderId, id));
      const visibleNotes = customerNotes.filter((n) => n.type === "customer");

      sendDispatchEmail({
        order: {
          id: order.id,
          paymentId: order.paymentId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          address: order.address,
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          total: order.total,
          trackingRef: (trackingRef !== undefined ? trackingRef : order.trackingRef) || null,
          trackingVendor: (trackingVendor !== undefined ? trackingVendor : order.trackingVendor) || null,
        },
        items,
        customerNotes: visibleNotes.map((n) => n.note),
        newNote: noteType === "customer" && note?.trim() ? note.trim() : null,
      }).catch((err) => console.error("Dispatch email failed:", err));
    }
  }

  return NextResponse.json({ success: true });
}

async function sendDispatchEmail({
  order,
  items,
  customerNotes,
  newNote,
}: {
  order: { id: string; paymentId: string; customerName: string; customerEmail: string; customerPhone: string; address: string; city: string; state: string; pincode: string; total: number; trackingRef: string | null; trackingVendor: string | null };
  items: Array<{ productName: string; price: number; quantity: number }>;
  customerNotes: string[];
  newNote: string | null;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const allNotes = [...customerNotes, ...(newNote ? [newNote] : [])];
  const itemLines = items
    .map((i) => `<tr><td style="padding:6px 0;border-bottom:1px solid #EAD9C8">${esc(i.productName)}</td><td style="padding:6px 0;border-bottom:1px solid #EAD9C8;text-align:center">${i.quantity}</td><td style="padding:6px 0;border-bottom:1px solid #EAD9C8;text-align:right">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td></tr>`)
    .join("");

  const hasTracking = !!(order.trackingRef || order.trackingVendor);
  const trackingBlock = hasTracking
    ? `<div style="background:#EAD9C8;padding:16px;margin:16px 0;border-left:4px solid #C9953C">
        <p style="margin:0 0 8px;font-size:12px;color:#8B5E3C;text-transform:uppercase;letter-spacing:1px">Shipment Tracking</p>
        ${order.trackingVendor ? `<p style="margin:0 0 4px;font-size:13px;color:#4A2512"><strong>Courier:</strong> ${esc(order.trackingVendor)}</p>` : ""}
        ${order.trackingRef ? `<p style="margin:0 0 4px;font-size:13px;color:#4A2512"><strong>Tracking Reference:</strong></p><p style="margin:0;font-size:18px;font-family:monospace;font-weight:bold;color:#1A0E08">${esc(order.trackingRef)}</p>` : ""}
        <p style="margin:8px 0 0;font-size:12px;color:#4A2512">Use this reference to track your shipment with the courier.</p>
      </div>`
    : "";

  const notesBlock = allNotes.length > 0
    ? `<div style="margin:16px 0"><p style="font-size:12px;color:#8B5E3C;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Note from Bean Leaf Brew</p>${allNotes.map((n) => `<p style="font-size:14px;color:#4A2512;background:#F7F0E6;padding:10px;margin:4px 0">${esc(n)}</p>`).join("")}</div>`
    : "";

  await transporter.sendMail({
    from: `"Bean Leaf Brew" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: order.customerEmail,
    bcc: process.env.ADMIN_EMAIL,
    subject: `Your order has been dispatched - Bean Leaf Brew #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1A0E08">
        <div style="background:#1A0E08;padding:24px;text-align:center">
          <h1 style="color:#F7F0E6;margin:0;font-size:24px">Bean Leaf Brew</h1>
        </div>
        <div style="padding:32px;background:#F7F0E6">
          <h2 style="color:#4A2512">Your order is on its way!</h2>
          <p>Hi ${esc(order.customerName)}, great news - your order has been dispatched.</p>
          <p style="color:#8B5E3C;font-size:13px">Order ID: ${esc(order.id)}</p>

          ${trackingBlock}
          ${notesBlock}

          <h3 style="color:#4A2512;border-bottom:1px solid #EAD9C8;padding-bottom:8px">Order Summary</h3>
          <table style="width:100%;font-size:14px">
            <thead><tr>
              <th style="text-align:left;padding-bottom:6px;color:#8B5E3C">Product</th>
              <th style="text-align:center;padding-bottom:6px;color:#8B5E3C">Qty</th>
              <th style="text-align:right;padding-bottom:6px;color:#8B5E3C">Amount</th>
            </tr></thead>
            <tbody>${itemLines}</tbody>
            <tfoot><tr>
              <td colspan="2" style="padding-top:10px;font-weight:bold">Total</td>
              <td style="padding-top:10px;text-align:right;font-weight:bold">₹${order.total.toLocaleString("en-IN")}</td>
            </tr></tfoot>
          </table>

          <p style="margin-top:20px"><strong>Delivery to:</strong><br/>${esc(order.address)}, ${esc(order.city)}, ${esc(order.state)} - ${esc(order.pincode)}</p>
          <p>Expected delivery: 3-5 business days.</p>
          <p style="color:#C9953C">— Team Bean Leaf Brew</p>
        </div>
      </div>`,
  });
}
