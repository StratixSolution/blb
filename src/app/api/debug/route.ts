import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { pendingOrders } from "@/db/schema";
import { desc, sql } from "drizzle-orm";

// Temporary debug endpoint - DELETE after issue is resolved
export async function GET() {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  const tursoUrl = process.env.TURSO_DATABASE_URL ?? "";

  let pendingCount = 0;
  let recentPending: { id: string; created_at: string }[] = [];
  let dbError: string | null = null;
  let insertTestResult: string = "not_run";

  try {
    const rows = await db.select().from(pendingOrders).orderBy(desc(pendingOrders.createdAt)).limit(5);
    pendingCount = rows.length;
    recentPending = rows.map((r) => ({ id: r.id, created_at: r.createdAt }));
  } catch (e) {
    dbError = String(e);
  }

  // Test that we can insert a row into the settings table (non-destructive check)
  try {
    await db.run(sql`INSERT OR REPLACE INTO settings (key, value, label) VALUES ('debug_ping', ${new Date().toISOString()}, 'debug')`);
    insertTestResult = "ok";
  } catch (e) {
    insertTestResult = String(e);
  }

  return NextResponse.json({
    razorpay_key_id: keyId,
    razorpay_secret_length: secret.length,
    razorpay_secret_prefix: secret.slice(0, 4),
    razorpay_secret_suffix: secret.slice(-4),
    turso_url: tursoUrl,
    pending_orders_count: pendingCount,
    recent_pending: recentPending,
    db_error: dbError,
    insert_test: insertTestResult,
  });
}
