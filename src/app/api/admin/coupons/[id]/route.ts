import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_COUPON_FIELDS = ["type", "amount", "minOrderAmount", "maxUses", "expiresAt", "active", "code"] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  const body = await req.json();
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_COUPON_FIELDS.includes(k as typeof ALLOWED_COUPON_FIELDS[number]))
  );

  await db.update(coupons).set(updates).where(eq(coupons.id, Number(id)));
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  await db.delete(coupons).where(eq(coupons.id, Number(id)));
  return NextResponse.json({ success: true });
}
