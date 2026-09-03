import { desc, eq, gte } from "drizzle-orm";
import {
  ArrowRight,
  Clock,
  Inbox,
  Megaphone,
  MessageCircle,
  Phone,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { ATTENTION_STATUSES, CLIENT_STATUS_META } from "@/app/dashboard/status";
import { campaignStats, clients, whatsappEvents } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";

const OUTCOME_LABEL: Record<string, string> = {
  cita_agendada: "Cita agendada",
  venta_cerrada: "Venta cerrada",
  seguimiento_pendiente: "Seguimiento pendiente",
  sin_resultado: "Sin resultado",
};

const STATUS_PILL = {
  teal: "bg-md-teal/20 text-md-teal",
  gold: "bg-md-admin-gold/20 text-md-admin-gold",
  blue: "bg-blue-400/20 text-blue-300",
  red: "bg-md-admin-coral/20 text-md-admin-coral",
} as const;

const AVATAR_PALETTE = ["#5FAE7B", "#E27FA0", "#E0A23A", "#8D7FE0", "#4FA3D1"];

// Deterministic per-entity color instead of list position, so the same
// client/contact always gets the same avatar color everywhere on the page
// (list position previously meant the same person could show up green in
// one card and gold in another).
function avatarColorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function StatTile({
  icon: Icon,
  label,
  value,
  subtitle,
  href,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  subtitle?: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-md-admin-coral text-white">
            <Icon size={18} strokeWidth={2} />
          </span>
          <span className="text-xs font-medium text-md-admin-rose-muted">{label}</span>
        </div>
        <Link
          href={href}
          aria-label={`Ver ${label.toLowerCase()}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
        >
          <ArrowRight size={13} strokeWidth={2} />
        </Link>
      </div>
      <p className="mt-5 bg-gradient-to-br from-md-admin-cream to-md-admin-gold-deep bg-clip-text font-admin-display text-4xl font-semibold text-transparent">
        {value}
      </p>
      {subtitle && (
        <p className="mt-2 text-xs font-medium text-md-admin-gold">{subtitle}</p>
      )}
    </div>
  );
}

function InitialAvatar({ name, color }: { name: string; color?: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ backgroundColor: color ?? "#E8695C" }}
    >
      {letter}
    </span>
  );
}

function ConversationRing({
  weekCount,
  trendPct,
}: {
  weekCount: number;
  trendPct: number | null;
}) {
  // The ring itself is decorative chrome framing the real count in the
  // center — not a data-driven fill. A fill tied to week-over-week % would
  // render as a near-invisible sliver whenever activity is low, which reads
  // as "broken" rather than "quiet". The actual trend, when there's a prior
  // week to compare against, is shown as real text below the count instead.
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - 0.88);

  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      <div
        className="absolute inset-2 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(240,193,75,0.55) 0%, rgba(232,105,92,0.35) 55%, transparent 75%)",
        }}
      />
      <svg viewBox="0 0 120 120" className="relative h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0C14B" />
            <stop offset="100%" stopColor="#E8695C" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center rounded-full border border-white/10 bg-black/25 px-6 py-5 backdrop-blur-md">
        <span className="text-xs font-medium text-md-admin-coral">Esta semana</span>
        <span className="bg-gradient-to-br from-md-admin-cream to-md-admin-gold-deep bg-clip-text font-admin-display text-3xl font-semibold text-transparent">
          {weekCount}
        </span>
        {trendPct !== null && (
          <span
            className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${
              trendPct >= 0 ? "text-md-teal" : "text-md-admin-coral"
            }`}
          >
            {trendPct >= 0 ? (
              <TrendingUp size={12} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={12} strokeWidth={2.5} />
            )}
            {trendPct >= 0 ? "+" : ""}
            {trendPct.toFixed(0)}% vs. semana anterior
          </span>
        )}
      </div>
    </div>
  );
}

export default async function AdminResumenPage() {
  await requireStaffOrRedirect("/admin");

  // Bounded windows instead of full-table loads: whatsapp_events and
  // campaign_stats grow unboundedly over time (unlike clients/campaigns,
  // which grow slowly with roster size) — 14 days covers both the 7-day
  // activity chart, the week-over-week ring comparison, and the 14-day
  // "quiet client" check; 30 days covers both the 7-day "stale campaign"
  // check and the 30-day rollup table.
  const now = new Date().getTime();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = new Date(now - 14 * DAY_MS);
  const thirtyDaysAgoDate = new Date(now - 30 * DAY_MS);

  const [allClients, allCampaigns, allEvents, recentEvents, allStats] =
    await Promise.all([
      withAppUser((tx) =>
        tx.query.clients.findMany({ orderBy: [desc(clients.createdAt)] })
      ),
      withAppUser((tx) => tx.query.campaigns.findMany()),
      withAppUser((tx) =>
        tx.query.whatsappEvents.findMany({
          where: gte(whatsappEvents.occurredAt, fourteenDaysAgo),
        })
      ),
      withAppUser((tx) =>
        tx
          .select({
            id: whatsappEvents.id,
            clientId: whatsappEvents.clientId,
            contactName: whatsappEvents.contactName,
            outcome: whatsappEvents.outcome,
            occurredAt: whatsappEvents.occurredAt,
            businessName: clients.businessName,
          })
          .from(whatsappEvents)
          .innerJoin(clients, eq(whatsappEvents.clientId, clients.id))
          .orderBy(desc(whatsappEvents.occurredAt))
          .limit(5)
      ),
      withAppUser((tx) =>
        tx.query.campaignStats.findMany({
          where: gte(campaignStats.statDate, thirtyDaysAgoDate.toISOString().slice(0, 10)),
        })
      ),
    ]);

  // Alerts: clients needing follow-up, stale campaigns, quiet clients —
  // real derived lists, not just counts.
  const clientById = new Map(allClients.map((c) => [c.id, c]));
  const campaignById = new Map(allCampaigns.map((c) => [c.id, c]));

  const latestStatByCampaign = new Map<string, string>();
  for (const stat of allStats) {
    const current = latestStatByCampaign.get(stat.campaignId);
    if (!current || stat.statDate > current) {
      latestStatByCampaign.set(stat.campaignId, stat.statDate);
    }
  }
  const staleCampaigns = allCampaigns.filter((c) => {
    if (c.status !== "activa") return false;
    const latest = latestStatByCampaign.get(c.id);
    if (!latest) return true;
    return now - new Date(latest).getTime() > 7 * DAY_MS;
  });

  const latestEventByClient = new Map<string, number>();
  for (const event of allEvents) {
    const t = new Date(event.occurredAt).getTime();
    const current = latestEventByClient.get(event.clientId);
    if (!current || t > current) {
      latestEventByClient.set(event.clientId, t);
    }
  }
  const quietClients = allClients.filter((c) => {
    if (c.status !== "activo") return false;
    const latest = latestEventByClient.get(c.id);
    if (!latest) return true;
    return now - latest > 14 * DAY_MS;
  });

  const attentionClients = allClients.filter((c) =>
    ATTENTION_STATUSES.includes(c.status)
  );

  // Aggregated reporting: last-30-days spend/clicks/impressions per client,
  // blended CTR, sorted by spend desc. allStats is already scoped to the
  // last 30 days at the query level, so no extra date filter needed here.
  const rollupByClient = new Map<
    string,
    { impressions: number; clicks: number; spendMxnCents: number }
  >();
  for (const stat of allStats) {
    const campaign = campaignById.get(stat.campaignId);
    if (!campaign) continue;
    const entry = rollupByClient.get(campaign.clientId) ?? {
      impressions: 0,
      clicks: 0,
      spendMxnCents: 0,
    };
    entry.impressions += stat.impressions;
    entry.clicks += stat.clicks;
    entry.spendMxnCents += stat.spendMxnCents;
    rollupByClient.set(campaign.clientId, entry);
  }
  const clientRollups = Array.from(rollupByClient.entries())
    .map(([clientId, totals]) => ({
      client: clientById.get(clientId),
      ...totals,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    }))
    .filter((row) => row.client)
    .sort((a, b) => b.spendMxnCents - a.spendMxnCents);

  const totalClients = allClients.length;
  const activeClients = allClients.filter((c) => c.status === "activo").length;
  const needsAttention = allClients.filter((c) =>
    ATTENTION_STATUSES.includes(c.status)
  ).length;
  const activeCampaigns = allCampaigns.filter((c) => c.status === "activa");
  const recentClients = allClients.slice(0, 5);

  // Real counts of WhatsApp events per day for the last 7 days — no
  // simulated/placeholder values, per the standing no-fabrication rule.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const isInDayRange = (event: (typeof allEvents)[number], day: Date) => {
    const occurred = new Date(event.occurredAt);
    return (
      occurred.getFullYear() === day.getFullYear() &&
      occurred.getMonth() === day.getMonth() &&
      occurred.getDate() === day.getDate()
    );
  };
  const thisWeekEvents = allEvents.filter((e) =>
    last7Days.some((day) => isInDayRange(e, day))
  );
  const priorWeekStart = new Date(today);
  priorWeekStart.setDate(priorWeekStart.getDate() - 13);
  const priorWeekEvents = allEvents.filter((e) => {
    const t = new Date(e.occurredAt).getTime();
    return t >= priorWeekStart.getTime() && t < last7Days[0].getTime();
  });
  const weekOverWeekTrendPct =
    priorWeekEvents.length > 0
      ? ((thisWeekEvents.length - priorWeekEvents.length) / priorWeekEvents.length) * 100
      : null;

  const outcomeCounts = {
    cita_agendada: allEvents.filter((e) => e.outcome === "cita_agendada").length,
    venta_cerrada: allEvents.filter((e) => e.outcome === "venta_cerrada").length,
    seguimiento_pendiente: allEvents.filter(
      (e) => e.outcome === "seguimiento_pendiente"
    ).length,
  };

  const QUICK_LINKS = [
    { href: "/admin/conversaciones", icon: MessageCircle, color: "#5FAE7B", label: "Conversaciones" },
    { href: "/admin/clients", icon: Users, color: "#8D7FE0", label: "Clientes" },
    { href: "/admin/campanas", icon: Megaphone, color: "#E0A23A", label: "Campañas" },
    { href: "/admin/solicitudes", icon: Inbox, color: "#4FA3D1", label: "Solicitudes" },
    { href: "/admin/staff", icon: ShieldCheck, color: "#E27FA0", label: "Staff" },
  ] as const;

  return (
    <div className="flex gap-6">
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-admin-display text-3xl font-semibold text-md-admin-cream">
              Resumen
            </h1>
            <p className="mt-1 text-sm text-md-admin-rose-muted">
              Vista general de clientes, campañas y actividad reciente.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/clients"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Ver clientes
            </Link>
            <Link
              href="/admin/clients#nuevo-cliente"
              className="rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90"
            >
              + Nuevo cliente
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <StatTile icon={Users} label="Clientes totales" value={totalClients} href="/admin/clients" />
          <StatTile
            icon={UserCheck}
            label="Clientes activos"
            value={activeClients}
            subtitle={`de ${totalClients} en total`}
            href="/admin/clients"
          />
          <StatTile
            icon={TriangleAlert}
            label="Requieren atención"
            value={needsAttention}
            subtitle={needsAttention > 0 ? "revisar estado de pago" : undefined}
            href="/admin/clients"
          />
          <StatTile
            icon={Megaphone}
            label="Campañas activas"
            value={activeCampaigns.length}
            subtitle={`de ${allCampaigns.length} en total`}
            href="/admin/campanas"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {(attentionClients.length > 0 ||
              staleCampaigns.length > 0 ||
              quietClients.length > 0) && (
              <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <TriangleAlert size={16} strokeWidth={2} className="text-md-admin-gold" />
                  <h2 className="text-sm font-semibold text-md-admin-cream">Requiere atención</h2>
                </div>
                <div className="flex flex-col divide-y divide-white/10">
                  {attentionClients.map((c) => (
                    <Link
                      key={`attn-${c.id}`}
                      href={`/admin/clients/${c.id}`}
                      className="flex items-center justify-between py-2.5 text-sm text-white/90 hover:text-md-admin-gold"
                    >
                      <span>{c.businessName}</span>
                      <span className="text-xs text-md-admin-rose-muted/70">
                        Estado: {CLIENT_STATUS_META[c.status].label}
                      </span>
                    </Link>
                  ))}
                  {staleCampaigns.map((c) => (
                    <Link
                      key={`stale-${c.id}`}
                      href={`/admin/campanas?clientId=${c.clientId}`}
                      className="flex items-center justify-between py-2.5 text-sm text-white/90 hover:text-md-admin-gold"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-md-admin-rose-muted/70">
                        Sin estadísticas hace más de 7 días
                      </span>
                    </Link>
                  ))}
                  {quietClients.map((c) => (
                    <Link
                      key={`quiet-${c.id}`}
                      href={`/admin/conversaciones?clientId=${c.id}`}
                      className="flex items-center justify-between py-2.5 text-sm text-white/90 hover:text-md-admin-gold"
                    >
                      <span>{c.businessName}</span>
                      <span className="text-xs text-md-admin-rose-muted/70">
                        Sin conversaciones hace más de 14 días
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-md-admin-cream">Clientes recientes</h2>
                <Link
                  href="/admin/clients#nuevo-cliente"
                  className="rounded-full bg-md-admin-gold px-3 py-1 text-xs font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90"
                >
                  + Nuevo
                </Link>
              </div>
              {recentClients.length === 0 ? (
                <p className="mt-3 text-sm text-md-admin-rose-muted">
                  Todavía no hay clientes registrados.
                </p>
              ) : (
                <div className="mt-4 flex flex-col divide-y divide-white/10">
                  {recentClients.map((client) => {
                    const meta = CLIENT_STATUS_META[client.status];
                    return (
                      <Link
                        key={client.id}
                        href={`/admin/clients/${client.id}`}
                        className="flex items-center gap-3 rounded-lg py-3 first:pt-0 last:pb-0 hover:bg-white/5"
                      >
                        <InitialAvatar
                          name={client.businessName}
                          color={avatarColorFor(client.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {client.businessName}
                          </p>
                          <p className="truncate text-xs text-md-admin-rose-muted/70">
                            {client.contactEmail}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL[meta.color]}`}
                        >
                          {meta.shortLabel}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
              <Link
                href="/admin/clients"
                className="mt-4 inline-block text-xs font-medium text-md-admin-gold hover:underline"
              >
                Ver todos los clientes →
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-black/25 p-6 text-white backdrop-blur-md">
            <div className="w-full">
              <p className="text-sm font-medium text-md-admin-gold">Conversaciones (7 días)</p>
              <p className="mt-1 text-xs text-md-admin-rose-muted/70">
                WhatsApp registrado, todos los clientes
              </p>
            </div>
            <ConversationRing
              weekCount={thisWeekEvents.length}
              trendPct={weekOverWeekTrendPct}
            />
            <div className="grid w-full grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-md-admin-coral text-white">
                  <Phone size={16} strokeWidth={2} />
                </span>
                <span className="text-base font-bold text-white">
                  {outcomeCounts.cita_agendada}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-md-admin-gold text-md-admin-card-deep">
                  <TrendingUp size={16} strokeWidth={2} />
                </span>
                <span className="text-base font-bold text-white">
                  {outcomeCounts.venta_cerrada}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-400 text-white">
                  <Clock size={16} strokeWidth={2} />
                </span>
                <span className="text-base font-bold text-white">
                  {outcomeCounts.seguimiento_pendiente}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-md-admin-cream">Últimas conversaciones</h2>
            <Link
              href="/admin/conversaciones"
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              + Nuevo
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="mt-3 text-sm text-md-admin-rose-muted">
              Todavía no hay conversaciones de WhatsApp registradas.
            </p>
          ) : (
            <div className="mt-4 flex flex-col divide-y divide-white/10">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <InitialAvatar
                    name={event.businessName}
                    color={avatarColorFor(event.clientId)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {event.businessName}
                    </p>
                    <p className="truncate text-xs text-md-admin-rose-muted/70">
                      {event.contactName ?? "Contacto sin nombre"} ·{" "}
                      {OUTCOME_LABEL[event.outcome]}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-md-admin-rose-muted/70">
                    {new Date(event.occurredAt).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/admin/conversaciones"
            className="mt-4 inline-block text-xs font-medium text-md-admin-gold hover:underline"
          >
            Ver todas las conversaciones →
          </Link>
        </div>

        {clientRollups.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md">
            <h2 className="text-sm font-semibold text-md-admin-cream">
              Rendimiento por cliente (últimos 30 días)
            </h2>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-md-admin-rose-muted/70">
                <tr>
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Impresiones</th>
                  <th className="py-2 pr-4">Clics</th>
                  <th className="py-2 pr-4">CTR</th>
                  <th className="py-2 pr-4">Gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {clientRollups.map((row) => (
                  <tr key={row.client!.id}>
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/admin/clients/${row.client!.id}`}
                        className="font-medium text-white hover:text-md-admin-gold hover:underline"
                      >
                        {row.client!.businessName}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-md-admin-rose-muted">
                      {row.impressions.toLocaleString("es-MX")}
                    </td>
                    <td className="py-2.5 pr-4 text-md-admin-rose-muted">
                      {row.clicks.toLocaleString("es-MX")}
                    </td>
                    <td className="py-2.5 pr-4 text-md-admin-rose-muted">{row.ctr.toFixed(2)}%</td>
                    <td className="py-2.5 pr-4 text-md-admin-rose-muted">
                      {(row.spendMxnCents / 100).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <aside className="hidden w-16 shrink-0 flex-col items-center gap-6 xl:flex">
        <Link
          href="/admin/clients"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-md-admin-cream text-md-admin-card-deep"
          aria-label="Clientes"
        >
          <Users size={18} strokeWidth={2} />
        </Link>

        {recentEvents.length > 0 && (
          <div className="flex flex-col gap-3">
            {recentEvents.map((event) => {
              const isPositive =
                event.outcome === "venta_cerrada" || event.outcome === "cita_agendada";
              return (
                <Link
                  key={event.id}
                  href={`/admin/clients/${event.clientId}`}
                  className="relative block"
                  aria-label={`${event.businessName} — ${OUTCOME_LABEL[event.outcome]}`}
                  title={`${event.businessName} — ${OUTCOME_LABEL[event.outcome]}`}
                >
                  <InitialAvatar
                    name={event.contactName ?? event.businessName}
                    color={avatarColorFor(event.clientId)}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-md-admin-bg ${
                      isPositive ? "bg-md-teal" : "bg-md-admin-gold"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-full border border-white/10 bg-black/25 p-2 backdrop-blur-md">
          {QUICK_LINKS.map(({ href, icon: Icon, color, label }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
              style={{ backgroundColor: color }}
            >
              <Icon size={16} strokeWidth={2} />
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
