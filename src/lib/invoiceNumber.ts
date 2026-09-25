import { db } from "@/db/client";
import { settings, orders } from "@/db/schema";
import { eq } from "drizzle-orm"; // used for orders.id lookup

export async function assignInvoiceNumber(orderId: string): Promise<string> {
  const invoiceNumber = await db.transaction(async (tx) => {
    // Fetch both counter and prefix inside the transaction so they're consistent
    const rows = await tx.select().from(settings);
    const rowMap = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    const current = parseInt(rowMap["invoice_counter"] ?? "539", 10);
    const next = current + 1;
    const prefix = rowMap["invoice_prefix"] ?? "BLB-WEB";

    // Upsert counter - works whether or not the row exists yet
    await tx
      .insert(settings)
      .values({
        key: "invoice_counter",
        value: String(next),
        label: "Invoice Counter",
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: String(next), updatedAt: new Date().toISOString() },
      });

    const num = `${prefix}-${String(current).padStart(4, "0")}`;

    // Update the order inside the SAME transaction so counter increment
    // and invoice assignment are atomic - no partial failure gap possible
    await tx.update(orders).set({ invoiceNumber: num }).where(eq(orders.id, orderId));

    return num;
  });

  return invoiceNumber;
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
