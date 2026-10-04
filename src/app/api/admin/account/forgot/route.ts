import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit } from "@/lib/rateLimit";
import { getAdminUser, updateAdminUser, adminNotificationEmail } from "@/lib/adminAccount";
import { generateResetToken } from "@/lib/adminPassword";
import { esc } from "@/lib/htmlEscape";

const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  // Always respond success regardless of outcome to avoid leaking whether an
  // admin account/email exists.
  const genericOk = NextResponse.json({ success: true });

  try {
    const admin = await getAdminUser();
    const email = adminNotificationEmail(admin);
    if (!email) return genericOk;

    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
    await updateAdminUser(admin.id, {
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: expiresAt,
    });

    const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const resetUrl = `${origin}/admin/reset?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      requireTLS: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? `"Bean Leaf Brew" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Bean Leaf Brew - Admin password reset",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1A0E08;">
          <div style="background: #1A0E08; padding: 24px; text-align: center;">
            <h1 style="color: #F7F0E6; margin: 0; font-size: 22px;">Bean Leaf Brew</h1>
          </div>
          <div style="padding: 32px; background: #F7F0E6;">
            <h2 style="color: #4A2512;">Admin password reset</h2>
            <p>A password reset was requested for the admin dashboard. Click the button below to set a new password. This link expires in 30 minutes.</p>
            <p style="margin: 28px 0;">
              <a href="${esc(resetUrl)}" style="background: #C9953C; color: #1A0E08; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 4px;">Reset password</a>
            </p>
            <p style="color: #8B5E3C; font-size: 13px;">If you didn't request this, you can safely ignore this email and your password will remain unchanged.</p>
            <p style="color: #8B5E3C; font-size: 12px; word-break: break-all;">${esc(resetUrl)}</p>
          </div>
        </div>`,
      text: `A password reset was requested for the Bean Leaf Brew admin dashboard.\n\nReset your password (expires in 30 minutes):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    });
  } catch (err) {
    console.error("admin forgot-password failed", err);
  }

  return genericOk;
}
