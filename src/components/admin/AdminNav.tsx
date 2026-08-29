"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/clients", label: "Clientes", exact: false },
  { href: "/admin/planes", label: "Planes", exact: false },
  { href: "/admin/campanas", label: "Campañas", exact: false },
  { href: "/admin/conversaciones", label: "Conversaciones", exact: false },
  { href: "/admin/calendario", label: "Calendario", exact: false },
  { href: "/admin/soporte", label: "Bitácora", exact: false },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-5 overflow-x-auto">
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
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
