import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { esc } from "@/lib/htmlEscape";

function sanitizeHeader(s: string): string {
  return String(s).replace(/[\r\n]/g, " ").slice(0, 200);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    const safeName = sanitizeHeader(name ?? "");
    const safeSubject = sanitizeHeader(subject ?? "");
    const safeEmail = sanitizeHeader(email ?? "");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      requireTLS: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Bean Leaf Brew Website" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: safeEmail,
      subject: `[BLB Contact] ${safeSubject}`,
      text: `From: ${safeName} <${safeEmail}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${esc(safeName)} &lt;${esc(safeEmail)}&gt;</p><p>${esc(message).replace(/\n/g, "<br/>")}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
