import { asc } from "drizzle-orm";
import { getCampaignsWithStats } from "@/app/dashboard/data";
import { ClientPicker } from "@/components/admin/ClientPicker";
import { clients } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import { createCampaign, createCampaignStat } from "./actions";

const PLATFORM_OPTIONS = [
  { value: "meta", label: "Meta Ads" },
  { value: "google", label: "Google Ads" },
] as const;

export default async function AdminCampanasPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  await requireStaffOrRedirect("/admin/campanas");

  const { clientId } = await searchParams;

  const allClients = await withAppUser((tx) =>
    tx.query.clients.findMany({ orderBy: [asc(clients.businessName)] })
  );

  const selectedClient = clientId
    ? allClients.find((client) => client.id === clientId)
    : undefined;

  const campaigns = selectedClient
    ? await getCampaignsWithStats(selectedClient.id)
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Campañas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Elige un cliente para ver o registrar sus campañas y estadísticas.
        </p>
      </div>

      <ClientPicker clients={allClients} selectedClientId={selectedClient?.id} />

      {selectedClient && (
        <div className="flex flex-col gap-8">
          <form
            action={createCampaign}
            className="flex flex-col gap-3 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 sm:flex-row sm:items-end sm:gap-4"
          >
            <input type="hidden" name="clientId" value={selectedClient.id} />
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Plataforma
              </label>
              <select
                name="platform"
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Nombre de la campaña
              </label>
              <input
                name="name"
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Objetivo (opcional)
              </label>
              <input
                name="objective"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
            >
              Crear campaña
            </button>
          </form>

          <div className="flex flex-col gap-4">
            {campaigns.length === 0 ? (
              <p className="text-sm text-gray-500">
                {selectedClient.businessName} todavía no tiene campañas
                registradas.
              </p>
            ) : (
              campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {campaign.name}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {campaign.platform === "meta" ? "Meta Ads" : "Google Ads"}
                        {" · "}
                        {campaign.status}
                      </p>
                    </div>
                    {campaign.latestStat && (
                      <p className="text-xs text-gray-500">
                        Última estadística:{" "}
                        {new Date(campaign.latestStat.statDate).toLocaleDateString(
                          "es-MX"
                        )}
                      </p>
                    )}
                  </div>

                  <form
                    action={createCampaignStat}
                    className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-4 lg:grid-cols-7"
                  >
                    <input type="hidden" name="campaignId" value={campaign.id} />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">Fecha</label>
                      <input
                        type="date"
                        name="statDate"
                        required
                        className="rounded border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">
                        Impresiones
                      </label>
                      <input
                        type="number"
                        name="impressions"
                        min={0}
                        className="rounded border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">Clics</label>
                      <input
                        type="number"
                        name="clicks"
                        min={0}
                        className="rounded border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">
                        Gasto (MXN)
                      </label>
                      <input
                        type="number"
                        name="spendMxn"
                        min={0}
                        step="0.01"
                        className="rounded border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">CTR (%)</label>
                      <input
                        type="number"
                        name="ctrPercent"
                        min={0}
                        step="0.01"
                        className="rounded border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">
                        CPC (MXN)
                      </label>
                      <input
                        type="number"
                        name="cpcMxn"
                        min={0}
                        step="0.01"
                        className="rounded border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">
                        Conversiones
                      </label>
                      <input
                        type="number"
                        name="conversions"
                        min={0}
                        className="rounded border border-gray-300 px-2 py-1.5 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="col-span-2 mt-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:col-span-4 lg:col-span-7 lg:w-fit"
                    >
                      Registrar estadística
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
