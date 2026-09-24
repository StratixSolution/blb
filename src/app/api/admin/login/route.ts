import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rateLimit";

function signToken(token: string): string {
  const secret = process.env.ADMIN_PASSWORD!;
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export function makeSessionCookieValue(): string {
  const token = crypto.randomBytes(32).toString("hex");
  return `${token}.${signToken(token)}`;
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue || !cookieValue.includes(".")) return false;
  const dot = cookieValue.lastIndexOf(".");
  const token = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (!token || !sig) return false;
  const expected = signToken(token);
  return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD env var is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const { password } = await req.json();
  if (password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const sessionValue = makeSessionCookieValue();
  const cookieStore = await cookies();
  cookieStore.set("admin_session", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
