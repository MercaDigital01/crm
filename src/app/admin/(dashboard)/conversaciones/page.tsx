import { asc } from "drizzle-orm";
import { getWhatsappEvents } from "@/app/dashboard/data";
import { ClientPicker } from "@/components/admin/ClientPicker";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EditToggle } from "@/components/admin/EditToggle";
import { SubmitButton } from "@/components/ui/SubmitButton";
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
        <h1 className="admin-h1">Conversaciones y ventas</h1>
        <p className="admin-subtle mt-1 text-sm">
          Elige un cliente para registrar el resultado de una conversación
          de WhatsApp.
        </p>
      </div>

      <ClientPicker clients={allClients} selectedClientId={selectedClient?.id} />

      {selectedClient && (
        <div className="flex flex-col gap-8">
          <form
            action={createWhatsappEvent}
            className="admin-card grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
          >
            <input type="hidden" name="clientId" value={selectedClient.id} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Nombre del contacto
              </label>
              <input name="contactName" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Teléfono
              </label>
              <input name="contactPhone" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Resultado
              </label>
              <select name="outcome" required>
                {OUTCOME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-white/60">
                Fecha y hora
              </label>
              <input type="datetime-local" name="occurredAt" required />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-medium text-white/60">
                Nota (opcional)
              </label>
              <input name="note" />
            </div>
            <SubmitButton className="rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90 sm:col-span-2 lg:col-span-5 lg:w-fit">
              Registrar conversación
            </SubmitButton>
          </form>

          <div className="admin-card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Nota</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td colSpan={4} className="px-4 py-3">
                      <EditToggle
                        key={JSON.stringify(event)}
                        view={
                          <div className="grid grid-cols-4 gap-2">
                            <p className="text-white">
                              {event.contactName ?? event.contactPhone ?? "—"}
                            </p>
                            <p className="text-md-admin-rose-muted">
                              {
                                OUTCOME_OPTIONS.find(
                                  (o) => o.value === event.outcome
                                )?.label
                              }
                            </p>
                            <p className="text-md-admin-rose-muted">
                              {new Date(event.occurredAt).toLocaleString(
                                "es-MX"
                              )}
                            </p>
                            <p className="text-md-admin-rose-muted">
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
                              className="text-xs"
                            />
                            <input
                              name="contactPhone"
                              defaultValue={event.contactPhone ?? ""}
                              placeholder="Teléfono"
                              className="text-xs"
                            />
                            <select
                              name="outcome"
                              defaultValue={event.outcome}
                              className="text-xs"
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
                              className="text-xs"
                            />
                            <div className="flex gap-1.5">
                              <input
                                name="note"
                                defaultValue={event.note ?? ""}
                                className="w-full text-xs"
                              />
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
                      className="px-4 py-6 text-center text-sm text-md-admin-rose-muted"
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
