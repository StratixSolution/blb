import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db/client";
import { coupons } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { code, type, amount, minOrderAmount, maxUses, expiresAt } = body;

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
        active: true,
      })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
  }
}
