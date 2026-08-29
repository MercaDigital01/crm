import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/admin-session";
import { requireStaffOrRedirect } from "@/lib/staff";
import { signOutAdmin } from "../sign-in/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStaffOrRedirect();
  const session = await getAdminSession();

  return (
    <div className="flex min-h-screen flex-1 bg-gray-50 text-gray-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <Link href="/admin" className="flex items-center gap-2 px-5 py-5">
          <Image
            src="/brand/logo-merca-digital.png"
            alt="Merca Digital"
            width={140}
            height={34}
            className="h-7 w-auto"
            priority
          />
          <span className="rounded-sm bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Admin
          </span>
        </Link>

        <AdminSidebar />

        <div className="p-3">
          <div className="admin-dark-pattern rounded-2xl bg-panel-chassis p-4 text-white">
            {session && (
              <p className="truncate text-xs font-medium text-md-teal">
                {session.username}
              </p>
            )}
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/40">
              Sesión de administrador
            </p>
            <form action={signOutAdmin} className="mt-3">
              <button
                type="submit"
                className="w-full rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/brand/logo-merca-digital.png"
              alt="Merca Digital"
              width={120}
              height={28}
              className="h-6 w-auto"
            />
          </Link>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Salir
            </button>
          </form>
        </header>
        <div className="border-b border-gray-200 bg-white px-3 py-2 md:hidden">
          <AdminNav />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
