"use client";

import {
  CalendarDays,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
  {
    href: "/dashboard/calendario",
    label: "Calendario",
    icon: CalendarDays,
    exact: false,
  },
  {
    href: "/dashboard/conversaciones",
    label: "Conversaciones",
    icon: MessageCircle,
    exact: false,
  },
  {
    href: "/dashboard/campanas",
    label: "Campañas",
    icon: Megaphone,
    exact: false,
  },
  { href: "/dashboard/pago", label: "Pago", icon: Wallet, exact: false },
] as const;

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl border-l-4 py-2.5 pl-3 pr-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-md-teal bg-md-teal/10 text-gray-900"
                : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon
              size={18}
              strokeWidth={2}
              className={`shrink-0 ${isActive ? "text-md-teal" : ""}`}
            />
            <span className={isActive ? "font-semibold" : ""}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
