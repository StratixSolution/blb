import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allOrders = await db.select().from(orders);

  const rows: string[][] = [];
  rows.push(["Order ID", "Date", "Customer", "Email", "Phone", "Address", "City", "State", "Pincode", "Status", "Items", "Discount", "Coupon", "Total", "Tracking Ref", "Payment ID"]);

  for (const o of allOrders) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
    const itemSummary = items.map((i) => `${i.productName} x${i.quantity}`).join("; ");

    rows.push([
      o.id,
      o.createdAt.slice(0, 10),
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      o.address,
      o.city,
      o.state,
      o.pincode,
      o.status,
      itemSummary,
      String(o.discount ?? 0),
      o.couponCode ?? "",
      String(o.total),
      o.trackingRef ?? "",
      o.paymentId,
    ]);
  }

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
