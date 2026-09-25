import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const rows = await db.select().from(settings);
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await req.json() as Record<string, string>;

  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    await db
      .update(settings)
      .set({ value, updatedAt: new Date().toISOString() })
      .where(eq(settings.key, key));
  }

  return NextResponse.json({ success: true });
}
