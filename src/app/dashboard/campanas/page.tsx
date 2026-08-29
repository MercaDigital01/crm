import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getCampaignsWithStats, getViewedClient } from "../data";

const PLATFORM_COPY = {
  meta: "Meta Ads",
  google: "Google Ads",
} as const;

const STATUS_COPY = {
  activa: "Activa",
  pausada: "Pausada",
  finalizada: "Finalizada",
} as const;

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

export default async function CampanasPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const campaigns = await getCampaignsWithStats(ownClient.id);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold text-gray-900">Tus campañas.</h1>

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

              {campaign.latestStat ? (
                <div className="mt-2 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      Impresiones
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {campaign.latestStat.impressions.toLocaleString("es-MX")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      Clics
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {campaign.latestStat.clicks.toLocaleString("es-MX")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      Gasto
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {(campaign.latestStat.spendMxnCents / 100).toLocaleString(
                        "es-MX",
                        { style: "currency", currency: "MXN" }
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      CTR
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {campaign.latestStat.ctr != null
                        ? `${(campaign.latestStat.ctr * 100).toFixed(2)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-2 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
                  Todavía no hay estadísticas cargadas para esta campaña.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
