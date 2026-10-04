import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { getAdminUser, updateAdminUser } from "@/lib/adminAccount";
import { hashPassword, verifyResetToken } from "@/lib/adminPassword";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`reset:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const { token, newPassword } = (await req.json()) as {
    token?: string;
    newPassword?: string;
  };

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const admin = await getAdminUser();

  if (!verifyResetToken(token, admin.resetTokenHash)) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  const expiresAt = admin.resetTokenExpiresAt ? Date.parse(admin.resetTokenExpiresAt) : 0;
  if (!expiresAt || Date.now() > expiresAt) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  await updateAdminUser(admin.id, {
    passwordHash: hashPassword(newPassword),
    resetTokenHash: null,
    resetTokenExpiresAt: null,
  });

  return NextResponse.json({ success: true });
}
