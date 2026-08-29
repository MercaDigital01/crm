import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getViewedClient, getWhatsappEvents } from "../data";

const OUTCOME_META = {
  cita_agendada: { label: "Cita agendada", pill: "bg-md-teal/10 text-md-teal" },
  venta_cerrada: { label: "Venta cerrada", pill: "bg-md-teal/10 text-md-teal" },
  seguimiento_pendiente: {
    label: "Seguimiento pendiente",
    pill: "bg-md-gold/10 text-[#a5790a]",
  },
  sin_resultado: { label: "Sin resultado", pill: "bg-md-blue/10 text-md-blue" },
} as const;

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

export default async function ConversacionesPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const events = await getWhatsappEvents(ownClient.id);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold text-gray-900">
        Conversaciones y ventas.
      </h1>

      {events.length === 0 ? (
        <p className="max-w-xl text-base leading-relaxed text-gray-500">
          Todavía no hay conversaciones registradas de tu agente de WhatsApp.
        </p>
      ) : (
        <div className={`rounded-2xl bg-white p-2 ${CARD_SHADOW}`}>
          <div className="flex flex-col divide-y divide-gray-100">
            {events.map((event) => {
              const meta = OUTCOME_META[event.outcome];
              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.contactName ?? event.contactPhone ?? "Contacto sin nombre"}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      {new Date(event.occurredAt).toLocaleString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {event.note && (
                      <p className="max-w-md text-sm leading-relaxed text-gray-500">
                        {event.note}
                      </p>
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
