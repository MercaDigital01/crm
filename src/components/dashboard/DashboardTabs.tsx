"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/calendario", label: "Calendario" },
  { href: "/dashboard/conversaciones", label: "Conversaciones" },
  { href: "/dashboard/campanas", label: "Campañas" },
  { href: "/dashboard/pago", label: "Pago" },
] as const;

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-5 overflow-x-auto">
      {TABS.map((tab) => {
        const active =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 py-1 text-sm font-medium transition-colors ${
              active
                ? "border-md-teal text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
