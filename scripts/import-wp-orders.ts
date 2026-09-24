/**
 * One-time import: WooCommerce (LocalWP MySQL) → Next.js SQLite (local.db)
 *
 * Run with:
 *   npx tsx scripts/import-wp-orders.ts
 *
 * Safe to re-run - skips orders that already exist (by ID).
 */

import mysql from "mysql2/promise";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, sql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import * as os from "os";
import * as path from "path";

// ── Config ────────────────────────────────────────────────────────────────────

const MYSQL_SOCKET = path.join(
  os.homedir(),
  "Library/Application Support/Local/run/7RU4l23rd/mysql/mysqld.sock"
);
const MYSQL_DB = "local";

const SQLITE_URL = process.env.TURSO_DATABASE_URL ?? "file:./local.db";

// WooCommerce → our schema status map
const STATUS_MAP: Record<string, schema.Order["status"]> = {
  "wc-completed":  "delivered",
  "wc-processing": "processing",
  "wc-pending":    "pending",
  "wc-cancelled":  "cancelled",
  "wc-refunded":   "cancelled",
  "wc-failed":     "cancelled",
  "wc-on-hold":    "pending",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface WpOrder {
  id: number;
  status: string;
  billing_email: string;
  total_amount: string;
  transaction_id: string | null;
  date_created_gmt: Date;
  date_updated_gmt: Date;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
}

interface WpLineItem {
  order_id: number;
  order_item_id: number;
  order_item_name: string;
  qty: string;
  line_total: string;
  product_id: string | null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Connecting to MySQL (LocalWP)...");
  const mysql_conn = await mysql.createConnection({
    socketPath: MYSQL_SOCKET,
    user: "root",
    password: "root",
    database: MYSQL_DB,
  });

  const libsql = createClient({ url: SQLITE_URL });
  const db = drizzle(libsql, { schema });

  // ── 1. Fetch all WooCommerce orders ──────────────────────────────────────

  console.log("Fetching WooCommerce orders...");
  const [wpOrders] = await mysql_conn.query<mysql.RowDataPacket[]>(`
    SELECT
      o.id,
      o.status,
      o.billing_email,
      o.total_amount,
      o.transaction_id,
      o.date_created_gmt,
      o.date_updated_gmt,
      a.first_name,
      a.last_name,
      a.phone,
      a.address_1,
      a.address_2,
      a.city,
      a.state,
      a.postcode
    FROM wp_wc_orders o
    LEFT JOIN wp_wc_order_addresses a
      ON a.order_id = o.id AND a.address_type = 'billing'
    WHERE o.type = 'shop_order'
      AND o.status NOT IN ('wc-failed')
    ORDER BY o.date_created_gmt ASC
  `);

  // ── 2. Fetch all line items ───────────────────────────────────────────────

  console.log("Fetching line items...");
  const [wpItems] = await mysql_conn.query<mysql.RowDataPacket[]>(`
    SELECT
      oi.order_id,
      oi.order_item_id,
      oi.order_item_name,
      MAX(CASE WHEN oim.meta_key = '_qty'        THEN oim.meta_value END) AS qty,
      MAX(CASE WHEN oim.meta_key = '_line_total' THEN oim.meta_value END) AS line_total,
      MAX(CASE WHEN oim.meta_key = '_product_id' THEN oim.meta_value END) AS product_id
    FROM wp_woocommerce_order_items oi
    JOIN wp_woocommerce_order_itemmeta oim
      ON oi.order_item_id = oim.order_item_id
    WHERE oi.order_item_type = 'line_item'
    GROUP BY oi.order_item_id, oi.order_id, oi.order_item_name
  `);

  // Group line items by order_id for fast lookup
  const itemsByOrder = new Map<number, WpLineItem[]>();
  for (const row of wpItems as WpLineItem[]) {
    const list = itemsByOrder.get(row.order_id) ?? [];
    list.push(row as WpLineItem);
    itemsByOrder.set(row.order_id, list);
  }

  // ── 3. Check existing orders to avoid duplicates ─────────────────────────

  const existing = await db.select({ id: schema.orders.id }).from(schema.orders);
  const existingIds = new Set(existing.map((r) => r.id));

  // ── 4. Insert orders + items + customers ─────────────────────────────────

  let importedOrders = 0;
  let skippedOrders = 0;
  let importedCustomers = 0;

  for (const row of wpOrders as WpOrder[]) {
    const orderId = `wp_${row.id}`;

    if (existingIds.has(orderId)) {
      skippedOrders++;
      continue;
    }

    const status = STATUS_MAP[row.status] ?? "pending";
    const name = [row.first_name, row.last_name].filter(Boolean).join(" ") || "Unknown";
    const email = row.billing_email || "unknown@import.local";
    const phone = row.phone || "";
    const address = [row.address_1, row.address_2].filter(Boolean).join(", ") || "";
    const city = row.city || "";
    const state = row.state || "";
    const pincode = row.postcode || "";
    const total = parseFloat(row.total_amount) || 0;
    const paymentId = row.transaction_id || `wp_import_${row.id}`;
    const createdAt = row.date_created_gmt
      ? new Date(row.date_created_gmt).toISOString()
      : new Date().toISOString();
    const updatedAt = row.date_updated_gmt
      ? new Date(row.date_updated_gmt).toISOString()
      : createdAt;

    // Insert order
    await db.insert(schema.orders).values({
      id: orderId,
      paymentId,
      status,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      address,
      city,
      state,
      pincode,
      total,
      discount: 0,
      couponCode: null,
      createdAt,
      updatedAt,
    });

    // Insert line items
    const items = itemsByOrder.get(row.id) ?? [];
    if (items.length > 0) {
      await db.insert(schema.orderItems).values(
        items.map((item) => ({
          orderId,
          productId: parseInt(item.product_id ?? "0") || 0,
          productName: item.order_item_name,
          price: parseFloat(item.line_total) / Math.max(parseInt(item.qty) || 1, 1),
          quantity: parseInt(item.qty) || 1,
        }))
      );
    }

    // Upsert customer
    const existingCustomer = await db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.email, email))
      .limit(1);

    if (existingCustomer.length > 0) {
      await db
        .update(schema.customers)
        .set({
          orderCount: sql`${schema.customers.orderCount} + 1`,
          totalSpend: sql`${schema.customers.totalSpend} + ${total}`,
          address,
          city,
          state,
          pincode,
          lastOrderAt: createdAt,
        })
        .where(eq(schema.customers.email, email));
    } else {
      await db.insert(schema.customers).values({
        name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        orderCount: 1,
        totalSpend: total,
        lastOrderAt: createdAt,
        createdAt,
      });
      importedCustomers++;
    }

    importedOrders++;
    process.stdout.write(`\r  Orders imported: ${importedOrders}`);
  }

  console.log(`\n\nDone!`);
  console.log(`  Orders imported : ${importedOrders}`);
  console.log(`  Orders skipped  : ${skippedOrders} (already existed)`);
  console.log(`  New customers   : ${importedCustomers}`);
  console.log(`  Total line items: ${[...itemsByOrder.values()].flat().length}`);

  await mysql_conn.end();
  libsql.close();
}

main().catch((err) => {
  console.error("\nImport failed:", err);
  process.exit(1);
});
