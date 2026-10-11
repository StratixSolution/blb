/**
 * Applies migration 002 (ground-coffee options) to the configured Turso DB.
 *
 * Idempotent: checks pragma_table_info before each ALTER, so it is safe to
 * run multiple times. Mirrors scripts/migrations/002-add-ground-coffee-options.sql.
 *
 * Run:
 *   npx tsx scripts/apply-migration-002.ts
 */

import { createClient } from "@libsql/client";
import { readFileSync, existsSync } from "fs";
import path from "path";

// Tolerant .env loader (same pattern as other scripts).
function loadEnv(file: string) {
  if (!existsSync(file)) return;
  const content = readFileSync(file, "utf8");
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv(path.join(process.cwd(), ".env"));
loadEnv(path.join(process.cwd(), ".env.local"));

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function hasColumn(table: string, column: string): Promise<boolean> {
  const res = await client.execute({
    sql: `SELECT name FROM pragma_table_info(?) WHERE name = ?`,
    args: [table, column],
  });
  return res.rows.length > 0;
}

async function addColumn(table: string, column: string, ddl: string) {
  if (await hasColumn(table, column)) {
    console.log(`ℹ️  ${table}.${column} already exists, skipping`);
    return;
  }
  await client.execute(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  console.log(`✅ Added ${table}.${column}`);
}

async function main() {
  console.log("Target DB:", process.env.TURSO_DATABASE_URL ?? "file:./local.db");
  await addColumn("products", "weight_options", "weight_options TEXT NOT NULL DEFAULT '[]'");
  await addColumn("products", "brewing_equipment_options", "brewing_equipment_options TEXT NOT NULL DEFAULT '[]'");
  await addColumn("order_items", "selected_weight", "selected_weight TEXT");
  await addColumn("order_items", "brewing_equipment", "brewing_equipment TEXT");
  console.log("✅ Migration 002 complete");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration 002 failed:", err);
    process.exit(1);
  });
