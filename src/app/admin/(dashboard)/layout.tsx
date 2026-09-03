import { desc } from "drizzle-orm";
import { Bell, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ATTENTION_STATUSES } from "@/app/dashboard/status";
import { clients } from "@/db/schema";
import { withAppUser } from "@/db/session";
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

  const allClients = await withAppUser((tx) =>
    tx.query.clients.findMany({ orderBy: [desc(clients.createdAt)] })
  );
  const needsAttention = allClients.filter((c) =>
    ATTENTION_STATUSES.includes(c.status)
  ).length;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex min-h-screen flex-1 bg-md-admin-bg text-md-admin-cream">
      <aside className="hidden w-64 shrink-0 flex-col md:flex">
        <Link
          href="/admin"
          className="mx-4 mt-4 flex items-center gap-2 rounded-2xl bg-md-admin-cream px-3 py-2.5"
        >
          <Image
            src="/brand/logo-merca-digital.png"
            alt="Merca Digital"
            width={140}
            height={34}
            className="h-6 w-auto"
            priority
          />
          <span className="rounded-sm bg-md-admin-coral/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-md-admin-coral">
            Admin
          </span>
        </Link>

        <AdminSidebar />

        <div className="mt-auto p-3">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-white backdrop-blur-md">
            {session && (
              <p className="truncate text-xs font-medium text-md-admin-gold">
                {session.username}
              </p>
            )}
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-md-admin-rose-muted">
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
        <header className="hidden items-center justify-between gap-4 px-8 py-6 md:flex">
          <p className="font-admin-display text-xl font-semibold">
            <span className="text-md-admin-coral">{greeting}</span>
            {session && (
              <>
                ,{" "}
                <span className="uppercase text-md-admin-gold">
                  {session.displayName || session.username}
                </span>
              </>
            )}
          </p>

          <form action="/admin/clients" className="flex-1 max-w-md">
            <label className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white/90 transition-colors focus-within:bg-white/15">
              <Search size={16} strokeWidth={2} className="shrink-0 text-white/50" />
              <input
                type="search"
                name="q"
                placeholder="Buscar"
                className="w-full border-0 bg-transparent p-0 placeholder:text-white/50 focus:outline-none"
              />
            </label>
          </form>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/admin/clients?status=${ATTENTION_STATUSES.join(",")}`}
              aria-label="Clientes que requieren atención"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
            >
              <Bell size={18} strokeWidth={2} />
              {needsAttention > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-md-admin-gold px-1 text-[10px] font-bold text-md-admin-card-deep">
                  {needsAttention}
                </span>
              )}
            </Link>
            {session && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-md-admin-coral text-sm font-semibold text-white">
                {(session.displayName || session.username).trim().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </header>

        <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-md-admin-bg px-4 py-3 md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/brand/logo-merca-digital.png"
              alt="Merca Digital"
              width={120}
              height={28}
              className="h-6 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/clients?status=${ATTENTION_STATUSES.join(",")}`}
              aria-label="Clientes que requieren atención"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80"
            >
              <Bell size={16} strokeWidth={2} />
              {needsAttention > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-md-admin-gold px-1 text-[10px] font-bold text-md-admin-card-deep">
                  {needsAttention}
                </span>
              )}
            </Link>
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
              >
                Salir
              </button>
            </form>
          </div>
        </header>
        <div className="border-b border-white/10 bg-md-admin-bg px-3 py-2 md:hidden">
          <AdminNav />
        </div>

        <main className="mx-auto w-full max-w-[1500px] flex-1 px-6 pb-10 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
