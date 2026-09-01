import { auth } from "@clerk/nextjs/server";
import { Bot } from "lucide-react";
import Link from "next/link";
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

type WhatsappEvent = Awaited<ReturnType<typeof getWhatsappEvents>>[number];

function groupByContact(events: WhatsappEvent[]) {
  const groups = new Map<string, WhatsappEvent[]>();
  for (const event of events) {
    const key = event.contactPhone ?? event.contactName ?? `sin-contacto-${event.id}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(event);
    groups.set(key, bucket);
  }

  return Array.from(groups.values())
    .map((bucket) =>
      bucket
        .slice()
        .sort(
          (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
        )
    )
    .sort((a, b) => {
      const aLatest = a[a.length - 1].occurredAt;
      const bLatest = b[b.length - 1].occurredAt;
      return new Date(bLatest).getTime() - new Date(aLatest).getTime();
    });
}

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
  const contactThreads = groupByContact(events);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Conversaciones y ventas.
        </h1>
        <Link
          href="/dashboard/conversaciones/agente"
          className="flex w-fit items-center gap-2 rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
        >
          <Bot size={16} strokeWidth={2} />
          Configurar agente de IA
        </Link>
      </div>

      {contactThreads.length === 0 ? (
        <p className="max-w-xl text-base leading-relaxed text-gray-500">
          Todavía no hay conversaciones registradas de tu agente de WhatsApp.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {contactThreads.map((thread) => {
            const contact = thread[thread.length - 1];
            const label =
              contact.contactName ?? contact.contactPhone ?? "Contacto sin nombre";

            return (
              <div
                key={`${label}-${contact.id}`}
                className={`rounded-2xl bg-white p-5 md:p-6 ${CARD_SHADOW}`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    {contact.contactName && contact.contactPhone && (
                      <p className="text-xs text-gray-400">{contact.contactPhone}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {thread.length} interacción{thread.length === 1 ? "" : "es"}
                  </span>
                </div>

                <div className="flex flex-col gap-4 border-l border-gray-100 pl-4">
                  {thread.map((event) => {
                    const meta = OUTCOME_META[event.outcome];
                    return (
                      <div key={event.id} className="relative flex flex-col gap-1">
                        <span className="absolute -left-[1.14rem] top-1.5 h-2 w-2 rounded-full bg-md-teal" />
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            {new Date(event.occurredAt).toLocaleString("es-MX", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <span
                            className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.pill}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {event.note && (
                          <p className="max-w-md text-sm leading-relaxed text-gray-600">
                            {event.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
