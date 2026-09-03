import { auth } from "@clerk/nextjs/server";
import { CalendarDays, Circle, CheckCircle2, MessageCircle, Megaphone } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import {
  getAgentConfig,
  getCampaignsWithStats,
  getContentItems,
  getOwnPlan,
  getViewedClient,
  getWhatsappEvents,
} from "./data";
import { CLIENT_STATUS_META } from "./status";

const STATUS_PILL = {
  teal: "bg-md-teal/20 text-md-teal",
  gold: "bg-md-admin-gold/20 text-md-admin-gold",
  blue: "bg-blue-400/20 text-blue-300",
  red: "bg-md-admin-coral/20 text-md-admin-coral",
} as const;

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
}) {
  return (
    <div className="admin-card flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-md-admin-coral text-white">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <p className="bg-gradient-to-br from-md-admin-cream to-md-admin-gold-deep bg-clip-text font-admin-display text-2xl font-semibold text-transparent">
          {value}
        </p>
        <p className="text-xs text-md-admin-rose-muted">{label}</p>
      </div>
    </div>
  );
}

export default async function DashboardResumenPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const [plan, contentItems, whatsappEvents, campaigns, agentConfig] =
    await Promise.all([
      getOwnPlan(ownClient.planId),
      getContentItems(ownClient.id),
      getWhatsappEvents(ownClient.id),
      getCampaignsWithStats(ownClient.id),
      getAgentConfig(ownClient.id),
    ]);

  const statusMeta = CLIENT_STATUS_META[ownClient.status];
  const activeCampaigns = campaigns.filter((c) => c.status === "activa");

  const checklist = [
    { label: "Plan asignado", done: !!plan, href: "/dashboard/pago" },
    {
      label: "Campaña activa",
      done: activeCampaigns.length > 0,
      href: "/dashboard/campanas",
    },
    {
      label: "Contenido programado",
      done: contentItems.length > 0,
      href: "/dashboard/calendario",
    },
    {
      label: "Agente de IA configurado",
      done: !!agentConfig,
      href: "/dashboard/conversaciones/agente",
    },
  ];
  const checklistComplete = checklist.every((item) => item.done);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const nextContentItem = contentItems
    .filter((item) => new Date(item.scheduledDate) >= todayStart)
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    )[0];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="admin-h1">Resumen de tu plan.</h1>
        <p className="admin-subtle mt-1 text-sm">{ownClient.businessName}</p>
      </div>

      {!checklistComplete && (
        <div className="admin-card flex flex-col gap-3 md:p-8">
          <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
            Primeros pasos
          </span>
          <div className="flex flex-col gap-2">
            {checklist.map((item) => {
              const Icon = item.done ? CheckCircle2 : Circle;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 text-sm"
                >
                  <Icon
                    size={16}
                    strokeWidth={2}
                    className={item.done ? "text-md-admin-gold" : "text-white/25"}
                  />
                  <span className={item.done ? "text-white/40 line-through" : "text-white/80"}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatTile
          icon={CalendarDays}
          label="Contenido programado"
          value={contentItems.length}
        />
        <StatTile
          icon={MessageCircle}
          label="Conversaciones registradas"
          value={whatsappEvents.length}
        />
        <StatTile
          icon={Megaphone}
          label="Campañas activas"
          value={activeCampaigns.length}
        />
      </div>

      {nextContentItem && (
        <div className="admin-card flex flex-col gap-3 md:p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
              Próxima publicación
            </span>
            <p className="text-lg font-semibold text-white">
              {nextContentItem.title}
            </p>
            <p className="text-sm text-md-admin-rose-muted">
              {new Date(nextContentItem.scheduledDate).toLocaleDateString(
                "es-MX",
                { weekday: "long", day: "2-digit", month: "long" }
              )}{" "}
              · {nextContentItem.platform}
            </p>
          </div>
          <Link
            href="/dashboard/calendario"
            className="w-fit shrink-0 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Ver calendario
          </Link>
        </div>
      )}

      <div className="admin-card md:p-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
              Tu plan
            </span>
            {plan ? (
              <>
                <p className="text-2xl font-semibold text-white">
                  {plan.name}
                </p>
                <p className="text-sm text-md-admin-rose-muted">
                  {(plan.priceMxnCents / 100).toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}{" "}
                  / mes
                </p>
                {plan.description && (
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-md-admin-rose-muted">
                    {plan.description}
                  </p>
                )}
              </>
            ) : (
              <p className="max-w-md text-sm leading-relaxed text-md-admin-rose-muted">
                Todavía no tienes un plan asignado — te avisamos en cuanto
                quede listo.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
              Estado de tu cuenta
            </span>
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUS_PILL[statusMeta.color]}`}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
