import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rateLimit";
import { db } from "@/db/client";
import { adminUsers } from "@/db/schema";
import { verifyPassword } from "@/lib/adminPassword";

// Session cookies are signed with ADMIN_PASSWORD to stay backward compatible with
// existing sessions and the middleware. (A future improvement is a dedicated
// SESSION_SECRET; keeping ADMIN_PASSWORD here avoids invalidating live sessions.)
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
    // ADMIN_PASSWORD is still required because it signs session cookies.
    console.error("ADMIN_PASSWORD env var is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const { password } = await req.json();
  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Prefer the DB-stored password hash (set via "change password" / reset flow).
  // Fall back to the ADMIN_PASSWORD env var when no DB password has been set yet,
  // preserving the original login behaviour.
  let authenticated = false;
  try {
    const [admin] = await db.select().from(adminUsers).limit(1);
    if (admin?.passwordHash) {
      authenticated = verifyPassword(password, admin.passwordHash);
    }
  } catch (err) {
    console.error("admin_users lookup failed, falling back to env password", err);
  }

  if (!authenticated) {
    // Env fallback (constant-time compare).
    const a = Buffer.from(password);
    const b = Buffer.from(adminPassword);
    authenticated = a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  if (!authenticated) {
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
