import { db } from "@/db/client";
import { products as productsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Product } from "@/types";
import { slugify } from "./utils";

function toProduct(row: typeof productsTable.$inferSelect): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    category: row.category as Product["category"],
    price: row.price,
    regularPrice: row.regularPrice ?? undefined,
    images: JSON.parse(row.images) as string[],
    tags: JSON.parse(row.tags) as string[],
    inStock: Boolean(row.inStock),
    visible: Boolean(row.visible),
    weight: row.weight ?? undefined,
    notes: row.notes ? (JSON.parse(row.notes) as string[]) : undefined,
    roast: row.roast ?? undefined,
    blend: row.blend ?? undefined,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await db.select().from(productsTable).where(eq(productsTable.visible, true));
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.slug, slug), eq(productsTable.visible, true)))
    .limit(1);
  return rows[0] ? toProduct(rows[0]) : undefined;
}

export async function getProductsByCategory(category: Product["category"]): Promise<Product[]> {
  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.category, category), eq(productsTable.visible, true)));
  return rows.map(toProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.featured, true), eq(productsTable.visible, true)));
  if (rows.length > 0) return rows.map(toProduct);
  // fallback: first 3 visible ground-coffee products
  const fallback = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.category, "ground-coffee"), eq(productsTable.visible, true)))
    .limit(3);
  return fallback.map(toProduct);
}

export { slugify };
