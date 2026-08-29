import { asc } from "drizzle-orm";
import { getContentItems } from "@/app/dashboard/data";
import { ClientPicker } from "@/components/admin/ClientPicker";
import { clients } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import { createContentItem } from "./actions";

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

  const allClients = await withAppUser((tx) =>
    tx.query.clients.findMany({ orderBy: [asc(clients.businessName)] })
  );

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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.scheduledDate).toLocaleDateString(
                        "es-MX"
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.platform}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.pillar ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {
                        FORMAT_OPTIONS.find((o) => o.value === item.format)
                          ?.label
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {
                        STATUS_OPTIONS.find((o) => o.value === item.status)
                          ?.label
                      }
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
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
