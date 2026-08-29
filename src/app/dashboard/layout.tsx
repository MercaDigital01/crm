import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { exitSupportView } from "@/app/admin/(dashboard)/clients/actions";
import { ClientSidebar } from "@/components/dashboard/ClientSidebar";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { isStaffUser } from "@/lib/staff";
import { getViewedClient } from "./data";
import { CLIENT_STATUS_META } from "./status";

const STATUS_DOT = {
  teal: "bg-md-teal",
  gold: "bg-md-gold",
  blue: "bg-md-blue",
  red: "bg-md-red",
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

  return (
    <div className="flex min-h-screen flex-1 bg-gray-50 text-gray-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <Link href="/" className="flex items-center gap-2 px-5 py-5">
          <Image
            src="/brand/logo-merca-digital.png"
            alt="Merca Digital"
            width={140}
            height={34}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <ClientSidebar />

        <div className="mt-auto p-3">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-gray-100 p-3">
            <div className="min-w-0">
              {ownClient && statusMeta && (
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[statusMeta.color]}`}
                  />
                  <span className="truncate text-xs font-medium text-gray-600">
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
          <div className="flex flex-col items-center justify-center gap-2 bg-md-gold/15 px-6 py-2.5 text-gray-900 sm:flex-row sm:gap-4">
            <p className="text-xs font-medium uppercase tracking-wide">
              Vista de soporte · viendo la cuenta de{" "}
              <span className="font-semibold">{ownClient.businessName}</span>
            </p>
            <form action={exitSupportView}>
              <button
                type="submit"
                className="rounded-full bg-gray-900 px-4 py-1 text-[10px] font-medium uppercase tracking-wide text-white transition-colors hover:bg-gray-700"
              >
                Salir
              </button>
            </form>
          </div>
        )}

        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
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
        <div className="border-b border-gray-200 bg-white px-3 py-2 md:hidden">
          <DashboardTabs />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
