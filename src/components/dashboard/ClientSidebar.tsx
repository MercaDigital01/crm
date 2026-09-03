"use client";

import {
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ActivityTimestamps,
  useUnreadSections,
} from "./useUnreadSections";

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
  {
    href: "/dashboard/entregables",
    label: "Entregables",
    icon: FolderOpen,
    exact: false,
  },
  { href: "/dashboard/pago", label: "Pago", icon: Wallet, exact: false },
] as const;

export function ClientSidebar({
  clientId,
  latestActivity = {},
}: {
  clientId: string;
  latestActivity?: ActivityTimestamps;
}) {
  const pathname = usePathname();
  const { unread, markSeen } = useUnreadSections(clientId, latestActivity);

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        const isUnread = !isActive && unread.has(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            onClick={() => markSeen(href)}
            className={`flex items-center gap-3 rounded-full py-2.5 pl-3 pr-3 text-sm font-medium transition-colors ${
              isActive
                ? "bg-md-admin-coral text-white shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} strokeWidth={2} className="shrink-0" />
            <span className={isActive ? "font-semibold" : ""}>{label}</span>
            {isUnread && (
              <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-md-admin-gold" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
