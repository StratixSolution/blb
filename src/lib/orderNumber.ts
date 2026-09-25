import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { like, sql } from "drizzle-orm";

export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `BLB_${yy}${mm}`;

  const [result] = await db
    .select({ max: sql<string | null>`MAX(order_number)` })
    .from(orders)
    .where(like(orders.orderNumber, `${prefix}%`));

  let seq = 1;
  if (result?.max) {
    const n = parseInt(result.max.slice(prefix.length), 10);
    if (!isNaN(n)) seq = n + 1;
  }

  return `${prefix}${String(seq).padStart(2, "0")}`;
}
