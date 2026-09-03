import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { exitSupportView } from "@/app/admin/(dashboard)/clients/actions";
import { ClientSidebar } from "@/components/dashboard/ClientSidebar";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { isStaffUser } from "@/lib/staff";
import { getLatestActivityTimestamps, getViewedClient } from "./data";
import { CLIENT_STATUS_META } from "./status";

const STATUS_DOT = {
  teal: "bg-md-teal",
  gold: "bg-md-admin-gold",
  blue: "bg-blue-400",
  red: "bg-md-admin-coral",
} as const;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient, isSupportView } = await getViewedClient(
    userId ?? null
  );
  const statusMeta = ownClient ? CLIENT_STATUS_META[ownClient.status] : null;
  const latestActivity = ownClient
    ? await getLatestActivityTimestamps(ownClient.id)
    : {};

  return (
    <div className="admin-panel flex min-h-screen flex-1 bg-md-admin-bg font-admin-sans text-white">
      <aside className="hidden w-64 shrink-0 flex-col md:flex print:hidden">
        <Link
          href="/"
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
        </Link>

        <ClientSidebar clientId={ownClient?.id ?? ""} latestActivity={latestActivity} />

        <div className="mt-auto p-3">
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/25 p-3 backdrop-blur-md">
            <div className="min-w-0">
              {ownClient && statusMeta && (
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[statusMeta.color]}`}
                  />
                  <span className="truncate text-xs font-medium text-md-admin-rose-muted">
                    {statusMeta.shortLabel}
                  </span>
                </div>
              )}
            </div>
            <UserButton />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {isSupportView && ownClient && (
          <div className="flex flex-col items-center justify-center gap-2 bg-md-admin-gold/20 px-6 py-2.5 text-md-admin-cream sm:flex-row sm:gap-4 print:hidden">
            <p className="text-xs font-medium uppercase tracking-wide">
              Vista de soporte · viendo la cuenta de{" "}
              <span className="font-semibold">{ownClient.businessName}</span>
            </p>
            <form action={exitSupportView}>
              <button
                type="submit"
                className="rounded-full bg-md-admin-card-deep px-4 py-1 text-[10px] font-medium uppercase tracking-wide text-white transition-colors hover:bg-md-admin-card-deep/80"
              >
                Salir
              </button>
            </form>
          </div>
        )}

        <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-md-admin-bg px-4 py-3 md:hidden print:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/logo-merca-digital.png"
              alt="Merca Digital"
              width={120}
              height={28}
              className="h-6 w-auto"
            />
          </Link>
          <UserButton />
        </header>
        <div className="border-b border-white/10 bg-md-admin-bg px-3 py-2 md:hidden print:hidden">
          <DashboardTabs clientId={ownClient?.id ?? ""} latestActivity={latestActivity} />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
