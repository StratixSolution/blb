import { NextRequest, NextResponse } from "next/server";

async function isValidSessionCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue || !cookieValue.includes(".")) return false;
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const dot = cookieValue.lastIndexOf(".");
  const token = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (!token || !sig || sig.length !== 64) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false, ["sign"]
    );
    const raw = await crypto.subtle.sign("HMAC", key, enc.encode(token));
    const expected = Array.from(new Uint8Array(raw))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    // Timing-safe string comparison
    let diff = 0;
    for (let i = 0; i < 64; i++) diff |= (sig.charCodeAt(i) ^ expected.charCodeAt(i));
    return diff === 0;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("admin_session")?.value;
  const validSession = await isValidSessionCookie(sessionCookie);

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !validSession) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (pathname === "/admin/login" && validSession) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
