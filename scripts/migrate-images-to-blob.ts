/**
 * One-time migration: local product images (public/images/...) → Vercel Blob.
 *
 * For every product, each image whose URL is a local path (starts with "/")
 * is uploaded to Vercel Blob and the product's `images` JSON is rewritten to
 * point at the returned Blob URL. Already-migrated Blob/HTTP URLs are left as-is.
 *
 * Idempotent & safe to re-run:
 *   - URLs that are already absolute (http/https) are skipped.
 *   - The same local file reused across products is uploaded only once (deduped).
 *   - If a local file is missing on disk, it is reported and left unchanged.
 *
 * Requires env:
 *   - TURSO_DATABASE_URL, TURSO_AUTH_TOKEN  (production DB)
 *   - BLOB_READ_WRITE_TOKEN                 (from your Vercel Blob store)
 *
 * Run:
 *   npx tsx scripts/migrate-images-to-blob.ts --dry-run   # preview, no writes
 *   npx tsx scripts/migrate-images-to-blob.ts             # perform migration
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { readFile, access } from "fs/promises";
import { readFileSync, existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { products } from "../src/db/schema";

// Tolerant .env loader (avoids Node's strict --env-file parser).
// Loads .env then .env.local; existing process.env values win.
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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv(path.join(process.cwd(), ".env"));
loadEnv(path.join(process.cwd(), ".env.local"));

const DRY_RUN = process.argv.includes("--dry-run");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function isLocalPath(url: string): boolean {
  return url.startsWith("/");
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is not set. Point this at your production DB.");
  }
  if (!DRY_RUN && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set. Pull it from Vercel: `vercel env pull .env.local`, " +
        "or copy it from the Blob store settings into your .env.",
    );
  }

  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(libsql, { schema: { products } });

  const publicDir = path.join(process.cwd(), "public");

  // Cache: local path "/images/x.webp" -> new Blob URL (dedupe shared files)
  const uploadCache = new Map<string, string>();
  const missingFiles = new Set<string>();

  const rows = await db.select().from(products);
  console.log(`${DRY_RUN ? "[DRY RUN] " : ""}Found ${rows.length} product(s).\n`);

  let productsUpdated = 0;
  let imagesUploaded = 0;
  let imagesSkipped = 0;

  for (const product of rows) {
    let current: string[];
    try {
      current = JSON.parse(product.images || "[]") as string[];
    } catch {
      console.warn(`  ! Product ${product.id} (${product.slug}) has invalid images JSON, skipping.`);
      continue;
    }

    const next: string[] = [];
    let changed = false;

    for (const url of current) {
      if (!isLocalPath(url)) {
        next.push(url);
        imagesSkipped++;
        continue;
      }

      // Already uploaded this local file in a previous product?
      const cached = uploadCache.get(url);
      if (cached) {
        next.push(cached);
        changed = true;
        continue;
      }

      const relative = url.replace(/^\//, ""); // "images/x.webp"
      const absolute = path.join(publicDir, relative);

      if (!(await fileExists(absolute))) {
        missingFiles.add(url);
        next.push(url); // leave unchanged
        continue;
      }

      const ext = path.extname(absolute).toLowerCase();
      const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
      const base = path.basename(absolute, ext);
      const blobName = `products/${base}-${crypto.randomBytes(4).toString("hex")}${ext}`;

      if (DRY_RUN) {
        console.log(`  [DRY RUN] would upload ${url}  ->  blob:${blobName}`);
        uploadCache.set(url, url); // placeholder so we don't log twice
        next.push(url);
        imagesUploaded++;
        changed = true;
        continue;
      }

      const data = await readFile(absolute);
      const blob = await put(blobName, data, { access: "public", contentType });
      uploadCache.set(url, blob.url);
      next.push(blob.url);
      imagesUploaded++;
      changed = true;
      console.log(`  uploaded ${url}  ->  ${blob.url}`);
    }

    if (changed && !DRY_RUN) {
      await db
        .update(products)
        .set({ images: JSON.stringify(next) })
        .where(eq(products.id, product.id));
      productsUpdated++;
      console.log(`  ✓ updated product ${product.id} (${product.slug})\n`);
    } else if (changed && DRY_RUN) {
      productsUpdated++;
      console.log(`  [DRY RUN] would update product ${product.id} (${product.slug})\n`);
    }
  }

  console.log("─".repeat(50));
  console.log(`${DRY_RUN ? "[DRY RUN] " : ""}Summary`);
  console.log(`  Products ${DRY_RUN ? "to update" : "updated"}: ${productsUpdated}`);
  console.log(`  Images ${DRY_RUN ? "to upload" : "uploaded"}:   ${imagesUploaded}`);
  console.log(`  Images skipped (already remote): ${imagesSkipped}`);
  if (missingFiles.size) {
    console.log(`\n  ⚠ ${missingFiles.size} referenced file(s) not found in public/ (left unchanged):`);
    for (const f of missingFiles) console.log(`      ${f}`);
  }

  libsql.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
