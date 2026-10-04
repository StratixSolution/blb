import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getAdminUser, updateAdminUser } from "@/lib/adminAccount";
import { hashPassword, verifyPassword } from "@/lib/adminPassword";
import crypto from "crypto";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { currentPassword, newPassword } = (await req.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }
  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  }

  const admin = await getAdminUser();

  // Verify the current password against the DB hash, or the env fallback if no
  // hash has been set yet.
  let currentOk = false;
  if (admin.passwordHash) {
    currentOk = verifyPassword(currentPassword, admin.passwordHash);
  } else {
    const envPassword = process.env.ADMIN_PASSWORD ?? "";
    const a = Buffer.from(currentPassword);
    const b = Buffer.from(envPassword);
    currentOk = a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  if (!currentOk) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  await updateAdminUser(admin.id, {
    passwordHash: hashPassword(newPassword),
    resetTokenHash: null,
    resetTokenExpiresAt: null,
  });

  return NextResponse.json({ success: true });
}
