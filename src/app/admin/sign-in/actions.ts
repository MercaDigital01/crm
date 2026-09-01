"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { staffUsers } from "@/db/schema";
import {
  clearAdminSession,
  createAdminSession,
  verifyPassword,
} from "@/lib/admin-session";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function safeRedirectPath(path: string | null): string {
  // Only allow relative paths back into /admin — never an absolute URL, to
  // avoid this becoming an open redirect.
  if (path && path.startsWith("/admin")) return path;
  return "/admin/clients";
}

export async function signInAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(
    formData.get("redirectTo") ? String(formData.get("redirectTo")) : null
  );

  // No identity exists yet at this point (that's what we're establishing),
  // so this reads via the raw `db` export bypassing RLS — same precedent
  // as claimUnclaimedProfile in src/app/dashboard/data.ts.
  const staffAccount = await db.query.staffUsers.findFirst({
    where: eq(staffUsers.username, username),
  });

  if (
    staffAccount?.lockedUntil &&
    staffAccount.lockedUntil.getTime() > Date.now()
  ) {
    redirect(
      `/admin/sign-in?error=locked&redirect_url=${encodeURIComponent(redirectTo)}`
    );
  }

  const validPassword =
    !!staffAccount && verifyPassword(password, staffAccount.passwordHash);

  if (!staffAccount || !validPassword) {
    if (staffAccount) {
      const attempts = staffAccount.failedAttempts + 1;
      await db
        .update(staffUsers)
        .set({
          failedAttempts: attempts,
          lockedUntil:
            attempts >= MAX_FAILED_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_MS)
              : null,
        })
        .where(eq(staffUsers.id, staffAccount.id));
    }
    redirect(
      `/admin/sign-in?error=1&redirect_url=${encodeURIComponent(redirectTo)}`
    );
  }

  await db
    .update(staffUsers)
    .set({ failedAttempts: 0, lockedUntil: null })
    .where(eq(staffUsers.id, staffAccount.id));

  await createAdminSession(username);
  redirect(redirectTo);
}

export async function signOutAdmin() {
  await clearAdminSession();
  redirect("/admin/sign-in");
}
