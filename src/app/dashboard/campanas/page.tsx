import { auth } from "@clerk/nextjs/server";
import { HelpCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { CampaignStatsPanel } from "@/components/dashboard/CampaignStatsPanel";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { isStaffUser } from "@/lib/staff";
import {
  getCampaignAdjustmentRequests,
  getCampaignsWithStats,
  getViewedClient,
} from "../data";
import { createCampaignAdjustmentRequest } from "./actions";

const PLATFORM_COPY = {
  meta: "Meta Ads",
  google: "Google Ads",
} as const;

const STATUS_COPY = {
  activa: "Activa",
  pausada: "Pausada",
  finalizada: "Finalizada",
} as const;

const ADJUSTMENT_TYPE_COPY = {
  pausar: "Pausar campaña",
  aumentar_presupuesto: "Aumentar presupuesto",
  reducir_presupuesto: "Reducir presupuesto",
  otro: "Otro ajuste",
} as const;

const REQUEST_STATUS_COPY = {
  pendiente: { label: "Pendiente", pill: "bg-md-gold/10 text-[#a5790a]" },
  revisado: { label: "Revisado", pill: "bg-md-teal/10 text-md-teal" },
  descartado: { label: "Descartado", pill: "bg-gray-100 text-gray-500" },
} as const;

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

const METRIC_HELP = [
  { term: "Impresiones", def: "Cuántas veces se mostró tu anuncio." },
  { term: "Clics", def: "Cuántas veces alguien tocó el anuncio." },
  {
    term: "CTR",
    def: "Porcentaje de gente que vio el anuncio y le dio clic. Arriba de 1.5% es sano.",
  },
  { term: "Gasto", def: "Lo invertido en la plataforma durante el periodo." },
];

export default async function CampanasPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const [campaigns, adjustmentRequests] = await Promise.all([
    getCampaignsWithStats(ownClient.id),
    getCampaignAdjustmentRequests(ownClient.id),
  ]);

  const campaignNameById = new Map(campaigns.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tus campañas.
          </h1>
          <PrintButton />
        </div>
        <details className={`group rounded-2xl bg-white p-4 print:hidden ${CARD_SHADOW}`}>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-gray-500">
            <HelpCircle size={14} strokeWidth={2} />
            ¿Qué significan estos números?
          </summary>
          <dl className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
            {METRIC_HELP.map(({ term, def }) => (
              <div key={term} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <dt className="w-24 shrink-0 text-xs font-semibold text-gray-900">
                  {term}
                </dt>
                <dd className="text-xs leading-relaxed text-gray-500">{def}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>

      {campaigns.length === 0 ? (
        <p className="max-w-xl text-base leading-relaxed text-gray-500">
          Todavía no tienes campañas activas registradas.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`flex flex-col gap-4 rounded-2xl bg-white p-6 ${CARD_SHADOW}`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {PLATFORM_COPY[campaign.platform]}
                </span>
                <span className="rounded-full bg-md-teal/10 px-2.5 py-1 text-xs font-medium text-md-teal">
                  {STATUS_COPY[campaign.status]}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {campaign.name}
              </p>
              {campaign.objective && (
                <p className="text-sm leading-relaxed text-gray-500">
                  {campaign.objective}
                </p>
              )}

              {campaign.stats.length > 0 ? (
                <CampaignStatsPanel stats={campaign.stats} />
              ) : (
                <p className="mt-2 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
                  Todavía no hay estadísticas cargadas para esta campaña.
                </p>
              )}

              <details className="border-t border-gray-100 pt-3 print:hidden">
                <summary className="cursor-pointer text-xs font-medium text-md-teal">
                  Solicitar ajuste
                </summary>
                <form
                  action={createCampaignAdjustmentRequest}
                  className="mt-3 flex flex-col gap-2"
                >
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <select
                    name="requestType"
                    className="rounded border border-gray-300 px-3 py-2 text-sm"
                  >
                    {Object.entries(ADJUSTMENT_TYPE_COPY).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input
                    name="notes"
                    placeholder="Notas (opcional)"
                    className="rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="w-fit rounded-full bg-md-teal px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-md-teal/90"
                  >
                    Enviar solicitud
                  </button>
                </form>
              </details>
            </div>
          ))}
        </div>
      )}

      {adjustmentRequests.length > 0 && (
        <div className={`flex flex-col gap-3 rounded-2xl bg-white p-6 md:p-8 print:hidden ${CARD_SHADOW}`}>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Tus solicitudes de ajuste
          </span>
          <div className="flex flex-col divide-y divide-gray-100">
            {adjustmentRequests.map((request) => {
              const meta = REQUEST_STATUS_COPY[request.status];
              return (
                <div
                  key={request.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {campaignNameById.get(request.campaignId) ?? "Campaña"} ·{" "}
                      {ADJUSTMENT_TYPE_COPY[request.requestType]}
                    </p>
                    {request.notes && (
                      <p className="text-xs text-gray-500">{request.notes}</p>
                    )}
                  </div>
                  <span
                    className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${meta.pill}`}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
