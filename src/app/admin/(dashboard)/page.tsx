import { desc, eq, gte } from "drizzle-orm";
import { ArrowUpRight, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { CLIENT_STATUS_META } from "@/app/dashboard/status";
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
  teal: "bg-md-teal/10 text-md-teal",
  gold: "bg-md-gold/10 text-[#a5790a]",
  blue: "bg-md-blue/10 text-md-blue",
  red: "bg-md-red/10 text-md-red",
} as const;

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

function StatTile({
  label,
  value,
  subtitle,
  tone,
  href,
}: {
  label: string;
  value: number;
  subtitle?: string;
  tone?: "positive" | "warning";
  href: string;
}) {
  return (
    <div className={`rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Link
          href={href}
          aria-label={`Ver ${label.toLowerCase()}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        >
          <ArrowUpRight size={14} strokeWidth={2} />
        </Link>
      </div>
      <p className="mt-3 text-4xl font-semibold text-gray-900">{value}</p>
      {subtitle && (
        <p
          className={`mt-2 text-xs font-medium ${
            tone === "warning" ? "text-[#a5790a]" : "text-md-teal"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-md-teal text-sm font-semibold text-white">
      {letter}
    </span>
  );
}

const DAY_LABEL = ["D", "L", "M", "M", "J", "V", "S"];

function ActivityChart({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  return (
    <div className="grid grid-cols-7 items-end gap-2" style={{ height: 96 }}>
      {counts.map((count, i) => {
        const heightPct = count === 0 ? 10 : Math.max(18, (count / max) * 100);
        return (
          <div key={i} className="flex h-full flex-col items-center justify-end gap-2">
            <div
              className={`w-full rounded-full ${
                count === 0
                  ? "admin-stripe-empty bg-white/10"
                  : "bg-md-teal"
              }`}
              style={{ height: `${heightPct}%` }}
              title={`${count} conversación${count === 1 ? "" : "es"}`}
            />
            <span className="text-[10px] font-medium text-white/60">
              {DAY_LABEL[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default async function AdminResumenPage() {
  await requireStaffOrRedirect("/admin");

  // Bounded windows instead of full-table loads: whatsapp_events and
  // campaign_stats grow unboundedly over time (unlike clients/campaigns,
  // which grow slowly with roster size) — 14 days covers both the 7-day
  // activity chart and the 14-day "quiet client" check; 30 days covers
  // both the 7-day "stale campaign" check and the 30-day rollup table.
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
    ["en_gracia", "suspendido"].includes(c.status)
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
    ["pendiente_de_pago", "en_gracia", "suspendido"].includes(c.status)
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
  const activityCounts = last7Days.map(
    (day) =>
      allEvents.filter((event) => {
        const occurred = new Date(event.occurredAt);
        return (
          occurred.getFullYear() === day.getFullYear() &&
          occurred.getMonth() === day.getMonth() &&
          occurred.getDate() === day.getDate()
        );
      }).length
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resumen</h1>
          <p className="mt-1 text-sm text-gray-400">
            Vista general de clientes, campañas y actividad reciente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clients"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Ver clientes
          </Link>
          <Link
            href="/admin/clients"
            className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
          >
            + Nuevo cliente
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatTile
          label="Clientes totales"
          value={totalClients}
          href="/admin/clients"
        />
        <StatTile
          label="Clientes activos"
          value={activeClients}
          subtitle={`de ${totalClients} en total`}
          tone="positive"
          href="/admin/clients"
        />
        <StatTile
          label="Requieren atención"
          value={needsAttention}
          subtitle={needsAttention > 0 ? "revisar estado de pago" : undefined}
          tone="warning"
          href="/admin/clients"
        />
        <StatTile
          label="Campañas activas"
          value={activeCampaigns.length}
          subtitle={`de ${allCampaigns.length} en total`}
          tone="positive"
          href="/admin/campanas"
        />
      </div>

      {(attentionClients.length > 0 ||
        staleCampaigns.length > 0 ||
        quietClients.length > 0) && (
        <div className={`flex flex-col gap-4 rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
          <div className="flex items-center gap-2">
            <TriangleAlert size={16} strokeWidth={2} className="text-[#a5790a]" />
            <h2 className="text-sm font-semibold text-gray-900">
              Requiere atención
            </h2>
          </div>
          <div className="flex flex-col divide-y divide-gray-100">
            {attentionClients.map((c) => (
              <Link
                key={`attn-${c.id}`}
                href={`/admin/clients/${c.id}`}
                className="flex items-center justify-between py-2.5 text-sm hover:text-md-teal"
              >
                <span>{c.businessName}</span>
                <span className="text-xs text-gray-400">
                  Estado: {CLIENT_STATUS_META[c.status].label}
                </span>
              </Link>
            ))}
            {staleCampaigns.map((c) => (
              <Link
                key={`stale-${c.id}`}
                href={`/admin/campanas?clientId=${c.clientId}`}
                className="flex items-center justify-between py-2.5 text-sm hover:text-md-teal"
              >
                <span>{c.name}</span>
                <span className="text-xs text-gray-400">
                  Sin estadísticas hace más de 7 días
                </span>
              </Link>
            ))}
            {quietClients.map((c) => (
              <Link
                key={`quiet-${c.id}`}
                href={`/admin/conversaciones?clientId=${c.id}`}
                className="flex items-center justify-between py-2.5 text-sm hover:text-md-teal"
              >
                <span>{c.businessName}</span>
                <span className="text-xs text-gray-400">
                  Sin conversaciones hace más de 14 días
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`rounded-2xl bg-white p-6 lg:col-span-2 ${CARD_SHADOW}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Clientes recientes
            </h2>
            <Link
              href="/admin/clients"
              className="rounded-full bg-md-teal/10 px-3 py-1 text-xs font-medium text-md-teal transition-colors hover:bg-md-teal/20"
            >
              + Nuevo
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              Todavía no hay clientes registrados.
            </p>
          ) : (
            <div className="mt-4 flex flex-col divide-y divide-gray-100">
              {recentClients.map((client) => {
                const meta = CLIENT_STATUS_META[client.status];
                return (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <InitialAvatar name={client.businessName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {client.businessName}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {client.contactEmail}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL[meta.color]}`}
                    >
                      {meta.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <Link
            href="/admin/clients"
            className="mt-4 inline-block text-xs font-medium text-md-teal hover:underline"
          >
            Ver todos los clientes →
          </Link>
        </div>

        <div
          className={`admin-dark-pattern flex flex-col justify-between rounded-3xl bg-panel-chassis p-6 text-white ${CARD_SHADOW}`}
        >
          <div>
            <p className="text-sm font-medium text-md-teal">
              Conversaciones (7 días)
            </p>
            <p className="mt-1 text-xs text-white/50">
              WhatsApp registrado, todos los clientes
            </p>
          </div>
          <div className="mt-6">
            <ActivityChart counts={activityCounts} />
          </div>
        </div>
      </div>

      <div className={`rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Últimas conversaciones
          </h2>
          <Link
            href="/admin/conversaciones"
            className="rounded-full bg-md-teal/10 px-3 py-1 text-xs font-medium text-md-teal transition-colors hover:bg-md-teal/20"
          >
            + Nuevo
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">
            Todavía no hay conversaciones de WhatsApp registradas.
          </p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-gray-100">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <InitialAvatar name={event.businessName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {event.businessName}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {event.contactName ?? "Contacto sin nombre"} ·{" "}
                    {OUTCOME_LABEL[event.outcome]}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-gray-400">
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
          className="mt-4 inline-block text-xs font-medium text-md-teal hover:underline"
        >
          Ver todas las conversaciones →
        </Link>
      </div>

      {clientRollups.length > 0 && (
        <div className={`overflow-x-auto rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
          <h2 className="text-sm font-semibold text-gray-900">
            Rendimiento por cliente (últimos 30 días)
          </h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Impresiones</th>
                <th className="py-2 pr-4">Clics</th>
                <th className="py-2 pr-4">CTR</th>
                <th className="py-2 pr-4">Gasto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientRollups.map((row) => (
                <tr key={row.client!.id}>
                  <td className="py-2.5 pr-4">
                    <Link
                      href={`/admin/clients/${row.client!.id}`}
                      className="font-medium text-gray-900 hover:text-md-teal hover:underline"
                    >
                      {row.client!.businessName}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">
                    {row.impressions.toLocaleString("es-MX")}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">
                    {row.clicks.toLocaleString("es-MX")}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">
                    {row.ctr.toFixed(2)}%
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">
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
  );
}
