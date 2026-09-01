import { asc } from "drizzle-orm";
import { getCampaignsWithStats } from "@/app/dashboard/data";
import { ClientPicker } from "@/components/admin/ClientPicker";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EditToggle } from "@/components/admin/EditToggle";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { clients } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import {
  bulkImportCampaignStats,
  createCampaign,
  createCampaignStat,
  deleteCampaign,
  deleteCampaignStat,
  duplicateCampaign,
  updateCampaign,
  updateCampaignStat,
} from "./actions";

const PLATFORM_OPTIONS = [
  { value: "meta", label: "Meta Ads" },
  { value: "google", label: "Google Ads" },
] as const;

const STATUS_OPTIONS = [
  { value: "activa", label: "Activa" },
  { value: "pausada", label: "Pausada" },
  { value: "finalizada", label: "Finalizada" },
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
            <SubmitButton className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90">
              Crear campaña
            </SubmitButton>
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
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-[16rem] flex-1">
                      <EditToggle
                        key={JSON.stringify(campaign)}
                        view={
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {campaign.name}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              {campaign.platform === "meta"
                                ? "Meta Ads"
                                : "Google Ads"}
                              {" · "}
                              {campaign.status}
                            </p>
                          </div>
                        }
                        edit={
                          <form
                            action={updateCampaign}
                            className="flex flex-col gap-1.5 sm:flex-row sm:items-end"
                          >
                            <input type="hidden" name="id" value={campaign.id} />
                            <input
                              name="name"
                              defaultValue={campaign.name}
                              required
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <input
                              name="objective"
                              defaultValue={campaign.objective ?? ""}
                              placeholder="Objetivo"
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <select
                              name="status"
                              defaultValue={campaign.status}
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="w-fit rounded-full bg-md-teal px-3 py-1 text-xs font-medium text-white hover:bg-md-teal/90"
                            >
                              Guardar
                            </button>
                          </form>
                        }
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {campaign.latestStat && (
                        <p className="text-xs text-gray-500">
                          Última:{" "}
                          {new Date(
                            campaign.latestStat.statDate
                          ).toLocaleDateString("es-MX")}
                        </p>
                      )}
                      <DeleteButton
                        action={deleteCampaign}
                        id={campaign.id}
                        confirmMessage={`¿Eliminar "${campaign.name}" y todas sus estadísticas?`}
                      />
                    </div>
                  </div>

                  {allClients.length > 1 && (
                    <form
                      action={duplicateCampaign}
                      className="flex items-center gap-2 border-t border-gray-100 pt-3"
                    >
                      <input type="hidden" name="campaignId" value={campaign.id} />
                      <label className="text-xs text-gray-500">
                        Duplicar a
                      </label>
                      <select
                        name="targetClientId"
                        required
                        defaultValue=""
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        <option value="" disabled>
                          Elegir cliente…
                        </option>
                        {allClients
                          .filter((c) => c.id !== selectedClient.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.businessName}
                            </option>
                          ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        Duplicar
                      </button>
                    </form>
                  )}

                  {campaign.stats.length > 0 && (
                    <details className="border-t border-gray-100 pt-3">
                      <summary className="cursor-pointer text-xs font-medium text-md-teal">
                        Ver historial de estadísticas ({campaign.stats.length})
                      </summary>
                      <div className="mt-3 flex flex-col divide-y divide-gray-100">
                        {campaign.stats
                          .slice()
                          .reverse()
                          .map((stat) => (
                            <div
                              key={stat.id}
                              className="flex flex-wrap items-center justify-between gap-2 py-2"
                            >
                              <EditToggle
                                key={JSON.stringify(stat)}
                                view={
                                  <p className="text-xs text-gray-600">
                                    {new Date(stat.statDate).toLocaleDateString(
                                      "es-MX"
                                    )}{" "}
                                    · {stat.impressions.toLocaleString("es-MX")} impr.
                                    · {stat.clicks.toLocaleString("es-MX")} clics ·{" "}
                                    {(stat.spendMxnCents / 100).toLocaleString(
                                      "es-MX",
                                      { style: "currency", currency: "MXN" }
                                    )}
                                  </p>
                                }
                                edit={
                                  <form
                                    action={updateCampaignStat}
                                    className="grid grid-cols-2 gap-1.5 sm:grid-cols-5"
                                  >
                                    <input type="hidden" name="id" value={stat.id} />
                                    <input
                                      type="date"
                                      name="statDate"
                                      defaultValue={stat.statDate}
                                      required
                                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                                    />
                                    <input
                                      type="number"
                                      name="impressions"
                                      min={0}
                                      defaultValue={stat.impressions}
                                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                                    />
                                    <input
                                      type="number"
                                      name="clicks"
                                      min={0}
                                      defaultValue={stat.clicks}
                                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                                    />
                                    <input
                                      type="number"
                                      name="spendMxn"
                                      min={0}
                                      step="0.01"
                                      defaultValue={stat.spendMxnCents / 100}
                                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                                    />
                                    <button
                                      type="submit"
                                      className="w-fit rounded-full bg-md-teal px-3 py-1 text-xs font-medium text-white hover:bg-md-teal/90"
                                    >
                                      Guardar
                                    </button>
                                  </form>
                                }
                              />
                              <DeleteButton
                                action={deleteCampaignStat}
                                id={stat.id}
                                confirmMessage="¿Eliminar esta estadística?"
                              />
                            </div>
                          ))}
                      </div>
                    </details>
                  )}

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
                    <SubmitButton className="col-span-2 mt-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:col-span-4 lg:col-span-7 lg:w-fit">
                      Registrar estadística
                    </SubmitButton>
                  </form>

                  <details className="mt-3 border-t border-gray-100 pt-3">
                    <summary className="cursor-pointer text-xs font-medium text-md-teal">
                      Importar CSV (varias filas de una vez)
                    </summary>
                    <form action={bulkImportCampaignStats} className="mt-3 flex flex-col gap-2">
                      <input type="hidden" name="campaignId" value={campaign.id} />
                      <textarea
                        name="csv"
                        required
                        rows={4}
                        placeholder={"fecha,impresiones,clics,gasto,conversiones\n2026-01-01,1200,34,150.00,2"}
                        className="rounded border border-gray-300 px-3 py-2 font-mono text-xs"
                      />
                      <SubmitButton className="w-fit rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100">
                        Importar
                      </SubmitButton>
                    </form>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
