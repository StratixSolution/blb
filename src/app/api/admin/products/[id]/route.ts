import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "1";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (body.name !== undefined) updates.name = body.name;
  if (body.slug !== undefined) updates.slug = body.slug.toLowerCase().replace(/\s+/g, "-");
  if (body.category !== undefined) updates.category = body.category;
  if (body.price !== undefined) updates.price = Number(body.price);
  if (body.regularPrice !== undefined) updates.regularPrice = body.regularPrice ? Number(body.regularPrice) : null;
  if (body.shortDescription !== undefined) updates.shortDescription = body.shortDescription;
  if (body.description !== undefined) updates.description = body.description;
  if (body.weight !== undefined) updates.weight = body.weight || null;
  if (body.roast !== undefined) updates.roast = body.roast || null;
  if (body.blend !== undefined) updates.blend = body.blend || null;
  if (body.notes !== undefined) updates.notes = JSON.stringify(Array.isArray(body.notes) ? body.notes : []);
  if (body.tags !== undefined) updates.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
  if (body.images !== undefined) updates.images = JSON.stringify(Array.isArray(body.images) ? body.images : []);
  if (body.inStock !== undefined) updates.inStock = Boolean(body.inStock);
  if (body.featured !== undefined) updates.featured = Boolean(body.featured);

  const [row] = await db.update(products).set(updates).where(eq(products.id, Number(id))).returning();

  revalidatePath("/");
  revalidatePath("/shop");
  if (row?.slug) revalidatePath(`/shop/${row.slug}`);

  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [row] = await db.delete(products).where(eq(products.id, Number(id))).returning();

  revalidatePath("/");
  revalidatePath("/shop");
  if (row?.slug) revalidatePath(`/shop/${row.slug}`);

  return NextResponse.json({ success: true });
}
