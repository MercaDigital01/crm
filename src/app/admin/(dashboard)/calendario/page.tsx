import { asc, eq } from "drizzle-orm";
import { getContentItems } from "@/app/dashboard/data";
import { ClientPicker } from "@/components/admin/ClientPicker";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EditorialMonthCalendar } from "@/components/admin/EditorialMonthCalendar";
import { EditToggle } from "@/components/admin/EditToggle";
import { clients, contentItems } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import {
  createContentItem,
  deleteContentItem,
  duplicateContentItem,
  updateContentItem,
} from "./actions";

const STATUS_OPTIONS = [
  { value: "borrador", label: "Borrador" },
  { value: "programado", label: "Programado" },
  { value: "publicado", label: "Publicado" },
] as const;

const FORMAT_OPTIONS = [
  { value: "reel", label: "Reel" },
  { value: "carrusel", label: "Carrusel" },
  { value: "imagen", label: "Imagen" },
] as const;

export default async function AdminCalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  await requireStaffOrRedirect("/admin/calendario");

  const { clientId } = await searchParams;

  const [allClients, allItemsAllClients] = await Promise.all([
    withAppUser((tx) =>
      tx.query.clients.findMany({ orderBy: [asc(clients.businessName)] })
    ),
    withAppUser((tx) =>
      tx
        .select({
          id: contentItems.id,
          scheduledDate: contentItems.scheduledDate,
          title: contentItems.title,
          businessName: clients.businessName,
        })
        .from(contentItems)
        .innerJoin(clients, eq(contentItems.clientId, clients.id))
    ),
  ]);

  const selectedClient = clientId
    ? allClients.find((client) => client.id === clientId)
    : undefined;

  const items = selectedClient
    ? await getContentItems(selectedClient.id)
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Calendario</h1>
        <p className="mt-1 text-sm text-gray-500">
          Elige un cliente para programar y revisar su calendario de
          contenido.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] md:p-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">
          Tablero editorial (todos los clientes)
        </h2>
        <EditorialMonthCalendar items={allItemsAllClients} />
      </div>

      <ClientPicker clients={allClients} selectedClientId={selectedClient?.id} />

      {selectedClient && (
        <div className="flex flex-col gap-8">
          <form
            action={createContentItem}
            className="grid grid-cols-1 gap-3 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
          >
            <input type="hidden" name="clientId" value={selectedClient.id} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Fecha
              </label>
              <input
                type="date"
                name="scheduledDate"
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Red social
              </label>
              <input
                name="platform"
                required
                placeholder="Instagram, TikTok…"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Pilar (opcional)
              </label>
              <input
                name="pillar"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Título
              </label>
              <input
                name="title"
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Formato
              </label>
              <select
                name="format"
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Estado
              </label>
              <select
                name="status"
                defaultValue="borrador"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90 sm:col-span-2 lg:col-span-6 lg:w-fit"
            >
              Programar contenido
            </button>
          </form>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Red</th>
                  <th className="px-4 py-3">Pilar</th>
                  <th className="px-4 py-3">Formato</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td colSpan={6} className="px-4 py-3">
                      <EditToggle
                        key={JSON.stringify(item)}
                        view={
                          <div className="grid grid-cols-6 gap-2">
                            <p className="text-gray-600">
                              {new Date(item.scheduledDate).toLocaleDateString(
                                "es-MX"
                              )}
                            </p>
                            <p className="font-medium text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-gray-600">{item.platform}</p>
                            <p className="text-gray-600">
                              {item.pillar ?? "—"}
                            </p>
                            <p className="text-gray-600">
                              {
                                FORMAT_OPTIONS.find(
                                  (o) => o.value === item.format
                                )?.label
                              }
                            </p>
                            <p className="text-gray-600">
                              {
                                STATUS_OPTIONS.find(
                                  (o) => o.value === item.status
                                )?.label
                              }
                            </p>
                          </div>
                        }
                        edit={
                          <form
                            action={updateContentItem}
                            className="grid grid-cols-2 gap-1.5 sm:grid-cols-6 sm:items-end"
                          >
                            <input type="hidden" name="id" value={item.id} />
                            <input
                              type="date"
                              name="scheduledDate"
                              defaultValue={item.scheduledDate}
                              required
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <input
                              name="title"
                              defaultValue={item.title}
                              required
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <input
                              name="platform"
                              defaultValue={item.platform}
                              required
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <input
                              name="pillar"
                              defaultValue={item.pillar ?? ""}
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <select
                              name="format"
                              defaultValue={item.format}
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            >
                              {FORMAT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-1.5">
                              <select
                                name="status"
                                defaultValue={item.status}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="shrink-0 rounded-full bg-md-teal px-3 py-1 text-xs font-medium text-white hover:bg-md-teal/90"
                              >
                                Guardar
                              </button>
                            </div>
                          </form>
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {allClients.length > 1 && (
                          <form action={duplicateContentItem} className="flex items-center gap-1">
                            <input type="hidden" name="itemId" value={item.id} />
                            <select
                              name="targetClientId"
                              required
                              defaultValue=""
                              className="rounded border border-gray-300 px-1.5 py-1 text-xs"
                            >
                              <option value="" disabled>
                                Duplicar a…
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
                              className="rounded-full border border-gray-300 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-100"
                            >
                              Ir
                            </button>
                          </form>
                        )}
                        <DeleteButton
                          action={deleteContentItem}
                          id={item.id}
                          confirmMessage={`¿Eliminar "${item.title}"?`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      {selectedClient.businessName} todavía no tiene
                      contenido programado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
