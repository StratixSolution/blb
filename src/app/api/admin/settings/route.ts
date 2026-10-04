import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { settings } from "@/db/schema";

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

  // Default labels for keys that may not exist in the DB yet (e.g. newly
  // introduced tax rates). Used only when inserting a brand-new row.
  const defaultLabels: Record<string, string> = {
    igst_rate: "IGST Rate (%)",
    cgst_rate: "CGST Rate (%)",
    sgst_rate: "SGST Rate (%)",
  };

  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    // Upsert so newly added settings keys are created rather than silently dropped.
    await db
      .insert(settings)
      .values({
        key,
        value,
        label: defaultLabels[key] ?? key,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date().toISOString() },
      });
  }

  return NextResponse.json({ success: true });
}
