import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { products } from "@/db/schema";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const rows = await db.select().from(products);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json();
  const { name, slug, category, price, regularPrice, shortDescription, description,
          weight, roast, blend, ean, notes, tags, images, inStock, featured } = body;

  if (!name || !slug || !category || !price) {
    return NextResponse.json({ error: "name, slug, category, price are required" }, { status: 400 });
  }

  const [row] = await db.insert(products).values({
    name,
    slug: (slug as string).toLowerCase().replace(/\s+/g, "-"),
    category,
    price: Number(price),
    regularPrice: regularPrice ? Number(regularPrice) : null,
    shortDescription: shortDescription ?? "",
    description: description ?? "",
    weight: weight ?? null,
    roast: roast ?? null,
    blend: blend ?? null,
    notes: JSON.stringify(Array.isArray(notes) ? notes : []),
    tags: JSON.stringify(Array.isArray(tags) ? tags : []),
    images: JSON.stringify(Array.isArray(images) ? images : []),
    inStock: Boolean(inStock),
    featured: Boolean(featured),
    ean: ean ?? null,
  }).returning();

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);

  return NextResponse.json(row);
}
