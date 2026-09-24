import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import { db } from "@/db/client";
import { orders, orderItems, orderNotes } from "@/db/schema";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session"));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, trackingRef, note, noteType } = body;

  // Add order note if provided
  if (note?.trim()) {
    await db.insert(orderNotes).values({
      orderId: id,
      note: note.trim(),
      type: noteType === "customer" ? "customer" : "internal",
    });
  }

  // Update order status / tracking ref
  if (status || trackingRef !== undefined) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (status) updates.status = status;
    if (trackingRef !== undefined) updates.trackingRef = trackingRef || null;

    await db.update(orders).set(updates).where(eq(orders.id, id));

    // Send dispatch email when status changes to shipped
    if (status === "shipped" && order.status !== "shipped") {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
      const customerNotes = await db
        .select()
        .from(orderNotes)
        .where(eq(orderNotes.orderId, id));
      const visibleNotes = customerNotes.filter((n) => n.type === "customer");

      sendDispatchEmail({
        order: { ...order, status: "shipped", trackingRef: (trackingRef || order.trackingRef) ?? null },
        items,
        customerNotes: visibleNotes.map((n) => n.note),
        // also include the note just added if it's customer-visible
        newNote: noteType === "customer" && note?.trim() ? note.trim() : null,
      }).catch((err) => console.error("Dispatch email failed:", err));
    }
  }

  return NextResponse.json({ success: true });
}

// ── Dispatch email ────────────────────────────────────────────────────────────

async function sendDispatchEmail({
  order,
  items,
  customerNotes,
  newNote,
}: {
  order: { id: string; paymentId: string; customerName: string; customerEmail: string; customerPhone: string; address: string; city: string; state: string; pincode: string; total: number; trackingRef: string | null };
  items: Array<{ productName: string; price: number; quantity: number }>;
  customerNotes: string[];
  newNote: string | null;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const allNotes = [...customerNotes, ...(newNote ? [newNote] : [])];
  const itemLines = items
    .map((i) => `<tr><td style="padding:6px 0;border-bottom:1px solid #EAD9C8">${i.productName}</td><td style="padding:6px 0;border-bottom:1px solid #EAD9C8;text-align:center">${i.quantity}</td><td style="padding:6px 0;border-bottom:1px solid #EAD9C8;text-align:right">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td></tr>`)
    .join("");

  const trackingBlock = order.trackingRef
    ? `<div style="background:#EAD9C8;padding:16px;margin:16px 0;border-left:4px solid #C9953C">
        <p style="margin:0 0 4px;font-size:12px;color:#8B5E3C;text-transform:uppercase;letter-spacing:1px">Tracking Reference</p>
        <p style="margin:0;font-size:18px;font-family:monospace;font-weight:bold;color:#1A0E08">${order.trackingRef}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#4A2512">Use this reference to track your shipment with the courier.</p>
      </div>`
    : "";

  const notesBlock = allNotes.length > 0
    ? `<div style="margin:16px 0"><p style="font-size:12px;color:#8B5E3C;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Note from Bean Leaf Brew</p>${allNotes.map((n) => `<p style="font-size:14px;color:#4A2512;background:#F7F0E6;padding:10px;margin:4px 0">${n}</p>`).join("")}</div>`
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
          <h2 style="color:#4A2512">Your order is on its way! ☕</h2>
          <p>Hi ${order.customerName}, great news - your order has been dispatched.</p>
          <p style="color:#8B5E3C;font-size:13px">Order ID: ${order.id}</p>

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

          <p style="margin-top:20px"><strong>Delivery to:</strong><br/>${order.address}, ${order.city}, ${order.state} - ${order.pincode}</p>
          <p>Expected delivery: 3-5 business days.</p>
          <p style="color:#C9953C">— Team Bean Leaf Brew</p>
        </div>
      </div>`,
  });
}
