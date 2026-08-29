"use server";

import { redirect } from "next/navigation";
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

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedPasswordHash) {
    throw new Error(
      "Falta configurar ADMIN_USERNAME / ADMIN_PASSWORD_HASH en .env.local"
    );
  }

  const validUsername = username === expectedUsername;
  const validPassword = verifyPassword(password, expectedPasswordHash);

  if (!validUsername || !validPassword) {
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
