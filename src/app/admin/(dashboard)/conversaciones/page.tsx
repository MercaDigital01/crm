import { asc } from "drizzle-orm";
import { getWhatsappEvents } from "@/app/dashboard/data";
import { ClientPicker } from "@/components/admin/ClientPicker";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EditToggle } from "@/components/admin/EditToggle";
import { clients } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import {
  createWhatsappEvent,
  deleteWhatsappEvent,
  updateWhatsappEvent,
} from "./actions";

function toDatetimeLocal(date: Date | string) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const OUTCOME_OPTIONS = [
  { value: "cita_agendada", label: "Cita agendada" },
  { value: "venta_cerrada", label: "Venta cerrada" },
  { value: "seguimiento_pendiente", label: "Seguimiento pendiente" },
  { value: "sin_resultado", label: "Sin resultado" },
] as const;

export default async function AdminConversacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  await requireStaffOrRedirect("/admin/conversaciones");

  const { clientId } = await searchParams;

  const allClients = await withAppUser((tx) =>
    tx.query.clients.findMany({ orderBy: [asc(clients.businessName)] })
  );

  const selectedClient = clientId
    ? allClients.find((client) => client.id === clientId)
    : undefined;

  const events = selectedClient
    ? await getWhatsappEvents(selectedClient.id)
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Conversaciones y ventas
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Elige un cliente para registrar el resultado de una conversación
          de WhatsApp.
        </p>
      </div>

      <ClientPicker clients={allClients} selectedClientId={selectedClient?.id} />

      {selectedClient && (
        <div className="flex flex-col gap-8">
          <form
            action={createWhatsappEvent}
            className="grid grid-cols-1 gap-3 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
          >
            <input type="hidden" name="clientId" value={selectedClient.id} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Nombre del contacto
              </label>
              <input
                name="contactName"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Teléfono
              </label>
              <input
                name="contactPhone"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Resultado
              </label>
              <select
                name="outcome"
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {OUTCOME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Fecha y hora
              </label>
              <input
                type="datetime-local"
                name="occurredAt"
                required
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-medium text-gray-600">
                Nota (opcional)
              </label>
              <input
                name="note"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90 sm:col-span-2 lg:col-span-5 lg:w-fit"
            >
              Registrar conversación
            </button>
          </form>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Nota</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td colSpan={4} className="px-4 py-3">
                      <EditToggle
                        key={JSON.stringify(event)}
                        view={
                          <div className="grid grid-cols-4 gap-2">
                            <p className="text-gray-900">
                              {event.contactName ?? event.contactPhone ?? "—"}
                            </p>
                            <p className="text-gray-600">
                              {
                                OUTCOME_OPTIONS.find(
                                  (o) => o.value === event.outcome
                                )?.label
                              }
                            </p>
                            <p className="text-gray-600">
                              {new Date(event.occurredAt).toLocaleString(
                                "es-MX"
                              )}
                            </p>
                            <p className="text-gray-600">
                              {event.note ?? "—"}
                            </p>
                          </div>
                        }
                        edit={
                          <form
                            action={updateWhatsappEvent}
                            className="grid grid-cols-2 gap-1.5 sm:grid-cols-5 sm:items-end"
                          >
                            <input type="hidden" name="id" value={event.id} />
                            <input
                              name="contactName"
                              defaultValue={event.contactName ?? ""}
                              placeholder="Nombre"
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <input
                              name="contactPhone"
                              defaultValue={event.contactPhone ?? ""}
                              placeholder="Teléfono"
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <select
                              name="outcome"
                              defaultValue={event.outcome}
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            >
                              {OUTCOME_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="datetime-local"
                              name="occurredAt"
                              defaultValue={toDatetimeLocal(event.occurredAt)}
                              required
                              className="rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <div className="flex gap-1.5">
                              <input
                                name="note"
                                defaultValue={event.note ?? ""}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                              />
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
                      <DeleteButton
                        action={deleteWhatsappEvent}
                        id={event.id}
                        confirmMessage="¿Eliminar esta conversación?"
                      />
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-gray-500"
                    >
                      {selectedClient.businessName} todavía no tiene
                      conversaciones registradas.
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
