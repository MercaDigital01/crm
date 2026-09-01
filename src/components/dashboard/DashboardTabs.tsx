"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ActivityTimestamps,
  useUnreadSections,
} from "./useUnreadSections";

const TABS = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/calendario", label: "Calendario" },
  { href: "/dashboard/conversaciones", label: "Conversaciones" },
  { href: "/dashboard/campanas", label: "Campañas" },
  { href: "/dashboard/entregables", label: "Entregables" },
  { href: "/dashboard/pago", label: "Pago" },
] as const;

export function DashboardTabs({
  latestActivity = {},
}: {
  latestActivity?: ActivityTimestamps;
}) {
  const pathname = usePathname();
  const { unread, markSeen } = useUnreadSections(latestActivity);

  return (
    <nav className="flex items-center gap-5 overflow-x-auto">
      {TABS.map((tab) => {
        const active =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(tab.href);
        const isUnread = !active && unread.has(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            onClick={() => markSeen(tab.href)}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 py-1 text-sm font-medium transition-colors ${
              active
                ? "border-md-teal text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {isUnread && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-md-teal" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
