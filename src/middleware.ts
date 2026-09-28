import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function isValidSessionCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue || !cookieValue.includes(".")) return false;
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const dot = cookieValue.lastIndexOf(".");
  const token = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (!token || !sig || sig.length !== 64) return false;
  try {
    const expected = crypto.createHmac("sha256", secret).update(token).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("admin_session")?.value;
  const validSession = isValidSessionCookie(sessionCookie);

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
