import { asc, eq } from "drizzle-orm";
import { getContentItems } from "@/app/dashboard/data";
import { ClientPicker } from "@/components/admin/ClientPicker";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EditorialMonthCalendar } from "@/components/admin/EditorialMonthCalendar";
import { EditToggle } from "@/components/admin/EditToggle";
import { ThumbnailUpload } from "@/components/admin/ThumbnailUpload";
import { SubmitButton } from "@/components/ui/SubmitButton";
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
        <h1 className="admin-h1">Calendario</h1>
        <p className="admin-subtle mt-1 text-sm">
          Elige un cliente para programar y revisar su calendario de
          contenido.
        </p>
      </div>

      <div className="admin-card">
        <h2 className="mb-2 text-sm font-semibold text-md-admin-cream">
          Tablero editorial (todos los clientes)
        </h2>
        <EditorialMonthCalendar items={allItemsAllClients} />
      </div>

      <ClientPicker clients={allClients} selectedClientId={selectedClient?.id} />

      {selectedClient && (
        <div className="flex flex-col gap-8">
          <form
            action={createContentItem}
            className="admin-card grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
          >
            <input type="hidden" name="clientId" value={selectedClient.id} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Fecha
              </label>
              <input type="date" name="scheduledDate" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Red social
              </label>
              <input name="platform" required placeholder="Instagram, TikTok…" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Pilar (opcional)
              </label>
              <input name="pillar" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Título
              </label>
              <input name="title" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Formato
              </label>
              <select name="format" required>
                {FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Estado
              </label>
              <select name="status" defaultValue="borrador">
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <SubmitButton className="rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90 sm:col-span-2 lg:col-span-6 lg:w-fit">
              Programar contenido
            </SubmitButton>
          </form>

          <div className="admin-card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
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
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td colSpan={6} className="px-4 py-3">
                      <EditToggle
                        key={JSON.stringify(item)}
                        view={
                          <div className="grid grid-cols-6 gap-2">
                            <p className="text-md-admin-rose-muted">
                              {new Date(item.scheduledDate).toLocaleDateString(
                                "es-MX"
                              )}
                            </p>
                            <p className="font-medium text-white">
                              {item.title}
                            </p>
                            <p className="text-md-admin-rose-muted">{item.platform}</p>
                            <p className="text-md-admin-rose-muted">
                              {item.pillar ?? "—"}
                            </p>
                            <p className="text-md-admin-rose-muted">
                              {
                                FORMAT_OPTIONS.find(
                                  (o) => o.value === item.format
                                )?.label
                              }
                            </p>
                            <p className="text-md-admin-rose-muted">
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
                              className="text-xs"
                            />
                            <input
                              name="title"
                              defaultValue={item.title}
                              required
                              className="text-xs"
                            />
                            <input
                              name="platform"
                              defaultValue={item.platform}
                              required
                              className="text-xs"
                            />
                            <input
                              name="pillar"
                              defaultValue={item.pillar ?? ""}
                              className="text-xs"
                            />
                            <select
                              name="format"
                              defaultValue={item.format}
                              className="text-xs"
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
                                className="w-full text-xs"
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="shrink-0 rounded-full bg-md-admin-gold px-3 py-1 text-xs font-medium text-md-admin-card-deep hover:bg-md-admin-gold/90"
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
                        <ThumbnailUpload itemId={item.id} clientId={selectedClient.id} />
                        {allClients.length > 1 && (
                          <form action={duplicateContentItem} className="flex items-center gap-1">
                            <input type="hidden" name="itemId" value={item.id} />
                            <select
                              name="targetClientId"
                              required
                              defaultValue=""
                              className="text-xs"
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
                              className="rounded-full border border-white/20 px-2 py-1 text-xs text-white transition-colors hover:bg-white/10"
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
                      className="px-4 py-6 text-center text-sm text-md-admin-rose-muted"
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
