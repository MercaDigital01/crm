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

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

const STATUS_PILL = {
  teal: "bg-md-teal/10 text-md-teal",
  gold: "bg-md-gold/10 text-[#a5790a]",
  blue: "bg-md-blue/10 text-md-blue",
  red: "bg-md-red/10 text-md-red",
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
    <div className={`flex items-center gap-4 rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-md-teal/10 text-md-teal">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
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
        <h1 className="text-2xl font-semibold text-gray-900">
          Resumen de tu plan.
        </h1>
        <p className="mt-1 text-sm text-gray-500">{ownClient.businessName}</p>
      </div>

      {!checklistComplete && (
        <div className={`flex flex-col gap-3 rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`}>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
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
                    className={item.done ? "text-md-teal" : "text-gray-300"}
                  />
                  <span className={item.done ? "text-gray-400 line-through" : "text-gray-700"}>
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
        <div className={`flex flex-col gap-3 rounded-2xl bg-white p-6 md:p-8 sm:flex-row sm:items-center sm:justify-between ${CARD_SHADOW}`}>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Próxima publicación
            </span>
            <p className="text-lg font-semibold text-gray-900">
              {nextContentItem.title}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(nextContentItem.scheduledDate).toLocaleDateString(
                "es-MX",
                { weekday: "long", day: "2-digit", month: "long" }
              )}{" "}
              · {nextContentItem.platform}
            </p>
          </div>
          <Link
            href="/dashboard/calendario"
            className="w-fit shrink-0 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Ver calendario
          </Link>
        </div>
      )}

      <div className={`rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`}>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Tu plan
            </span>
            {plan ? (
              <>
                <p className="text-2xl font-semibold text-gray-900">
                  {plan.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(plan.priceMxnCents / 100).toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  })}{" "}
                  / mes
                </p>
                {plan.description && (
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
                    {plan.description}
                  </p>
                )}
              </>
            ) : (
              <p className="max-w-md text-sm leading-relaxed text-gray-500">
                Todavía no tienes un plan asignado — te avisamos en cuanto
                quede listo.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
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
