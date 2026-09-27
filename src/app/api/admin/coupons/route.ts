import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  const all = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json();
  const { code, type, amount, minOrderAmount, maxUses, expiresAt, referencedTo } = body;

  if (!code || !type || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const [created] = await db
      .insert(coupons)
      .values({
        code: (code as string).toUpperCase().trim(),
        type,
        amount: Number(amount),
        minOrderAmount: Number(minOrderAmount ?? 0),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt || null,
        referencedTo: referencedTo?.trim() || null,
        active: true,
      })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
  }
}
