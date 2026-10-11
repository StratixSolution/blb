import { db } from "@/db/client";
import { products as productsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Product } from "@/types";
import { getCategory, getCategoryLabel } from "./categories";
import { slugify } from "./utils";
import {
  GROUND_COFFEE_CATEGORY,
  BREWING_EQUIPMENT_CATALOG,
  parseWeightOptions,
  parseEquipmentOptions,
} from "./productOptions";

function toProduct(row: typeof productsTable.$inferSelect): Product {
  const cat = getCategory(row.category);
  const showWeight = cat ? cat.showWeight : true;
  const showRoast = cat ? cat.showRoast : true;
  const showBlend = cat ? cat.showBlend : true;
  const showNotes = cat ? cat.showNotes : true;
  // Selectable options only apply to ground coffee.
  const isGroundCoffee = row.category === GROUND_COFFEE_CATEGORY;
  const weightOptions = isGroundCoffee ? parseWeightOptions(row.weightOptions) : [];
  // Ground coffee defaults to the full brewing-equipment catalog when none is
  // explicitly configured, so the dropdown shows all options by default.
  const storedEquipment = isGroundCoffee ? parseEquipmentOptions(row.brewingEquipmentOptions) : [];
  const brewingEquipmentOptions = isGroundCoffee
    ? storedEquipment.length > 0
      ? storedEquipment
      : [...BREWING_EQUIPMENT_CATALOG]
    : [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    category: row.category,
    categoryLabel: getCategoryLabel(row.category),
    showWeight,
    showRoast,
    showBlend,
    showNotes,
    price: row.price,
    regularPrice: row.regularPrice ?? undefined,
    images: JSON.parse(row.images) as string[],
    tags: JSON.parse(row.tags) as string[],
    inStock: Boolean(row.inStock),
    visible: Boolean(row.visible),
    // Only expose coffee-specific fields when the category allows them.
    weight: showWeight ? (row.weight ?? undefined) : undefined,
    notes: showNotes && row.notes ? (JSON.parse(row.notes) as string[]) : undefined,
    roast: showRoast ? (row.roast ?? undefined) : undefined,
    blend: showBlend ? (row.blend ?? undefined) : undefined,
    weightOptions: weightOptions.length > 0 ? weightOptions : undefined,
    brewingEquipmentOptions: brewingEquipmentOptions.length > 0 ? brewingEquipmentOptions : undefined,
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
