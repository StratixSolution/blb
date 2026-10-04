import { db } from "@/db/client";
import { adminUsers, type AdminUser } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Fetch the single admin row, creating it (empty) on first access. */
export async function getAdminUser(): Promise<AdminUser> {
  const [existing] = await db.select().from(adminUsers).limit(1);
  if (existing) return existing;

  await db
    .insert(adminUsers)
    .values({
      email: process.env.ADMIN_EMAIL ?? null,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoNothing();

  const [created] = await db.select().from(adminUsers).limit(1);
  return created;
}

export async function updateAdminUser(
  id: number,
  values: Partial<Pick<AdminUser, "email" | "passwordHash" | "resetTokenHash" | "resetTokenExpiresAt">>
): Promise<void> {
  await db
    .update(adminUsers)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(adminUsers.id, id));
}

/**
 * The email the reset link is sent to. We only ever send to the configured
 * admin email (ADMIN_EMAIL) or the stored admin email — never to an
 * attacker-supplied address.
 */
export function adminNotificationEmail(admin: AdminUser): string | undefined {
  return admin.email ?? process.env.ADMIN_EMAIL ?? undefined;
}
