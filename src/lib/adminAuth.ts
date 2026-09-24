import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isValidSession } from "@/app/api/admin/login/route";

export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get("admin_session")?.value;
  if (!isValidSession(val)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const val = cookieStore.get("admin_session")?.value;
  return isValidSession(val);
}
