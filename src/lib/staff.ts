import { redirect } from "next/navigation";
import { getAdminSession } from "./admin-session";

export async function isStaffUser(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

// Gate for /admin pages. Distinguishes "not signed in" (send to the admin
// login, returning here afterwards) from nothing else — there is no
// "signed in but not staff" case anymore, since admin auth is a separate
// system from Clerk and only ever represents staff.
export async function requireStaffOrRedirect(
  returnPath: string = "/admin/clients"
): Promise<void> {
  const session = await getAdminSession();
  if (!session) {
    redirect(`/admin/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);
  }
}
