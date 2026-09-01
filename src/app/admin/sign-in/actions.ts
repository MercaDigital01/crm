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

  const validPassword =
    !!staffAccount && verifyPassword(password, staffAccount.passwordHash);

  if (!staffAccount || !validPassword) {
    redirect(
      `/admin/sign-in?error=1&redirect_url=${encodeURIComponent(redirectTo)}`
    );
  }

  await createAdminSession(username);
  redirect(redirectTo);
}

export async function signOutAdmin() {
  await clearAdminSession();
  redirect("/admin/sign-in");
}
