"use client";

import {
  CalendarDays,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/admin/clients", label: "Clientes", icon: Users, exact: false },
      { href: "/admin/planes", label: "Planes", icon: Package, exact: false },
      {
        href: "/admin/campanas",
        label: "Campañas",
        icon: Megaphone,
        exact: false,
      },
      {
        href: "/admin/conversaciones",
        label: "Conversaciones",
        icon: MessageCircle,
        exact: false,
      },
      {
        href: "/admin/calendario",
        label: "Calendario",
        icon: CalendarDays,
        exact: false,
      },
      {
        href: "/admin/solicitudes",
        label: "Solicitudes",
        icon: Inbox,
        exact: false,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        href: "/admin/soporte",
        label: "Bitácora",
        icon: ClipboardList,
        exact: false,
      },
      {
        href: "/admin/staff",
        label: "Staff",
        icon: ShieldCheck,
        exact: false,
      },
    ],
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6 px-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {group.label}
          </span>
          {group.items.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname.startsWith(href);
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
        </div>
      ))}
    </nav>
  );
}
