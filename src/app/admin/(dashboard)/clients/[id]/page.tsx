import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCampaignAdjustmentRequests,
  getCampaignsWithStats,
  getClientTasks,
  getContentItems,
  getContentRequests,
  getWhatsappEvents,
} from "@/app/dashboard/data";
import { CLIENT_STATUS_META } from "@/app/dashboard/status";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { SelectAndSubmit } from "@/components/admin/SelectAndSubmit";
import { TaskCheckbox } from "@/components/admin/TaskCheckbox";
import { activityLog, clients } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import {
  createClientTask,
  deleteClientTask,
  toggleClientTask,
  updateClientPlan,
  updateClientProfile,
  updateClientStatus,
} from "../actions";

const STATUS_OPTIONS = Object.entries(CLIENT_STATUS_META).map(
  ([value, meta]) => ({ value, label: meta.label })
);

const STATUS_PILL = {
  teal: "bg-md-teal/10 text-md-teal",
  gold: "bg-md-gold/10 text-[#a5790a]",
  blue: "bg-md-blue/10 text-md-blue",
  red: "bg-md-red/10 text-md-red",
} as const;

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffOrRedirect("/admin/clients");
  const { id } = await params;

  const [client, allPlans] = await Promise.all([
    withAppUser((tx) => tx.query.clients.findFirst({ where: eq(clients.id, id) })),
    withAppUser((tx) => tx.query.plans.findMany()),
  ]);

  if (!client) {
    notFound();
  }

  const [campaigns, contentItems, events, tasks, contentReqs, adjustmentReqs, recentActivity] =
    await Promise.all([
      getCampaignsWithStats(client.id),
      getContentItems(client.id),
      getWhatsappEvents(client.id),
      getClientTasks(client.id),
      getContentRequests(client.id),
      getCampaignAdjustmentRequests(client.id),
      withAppUser((tx) =>
        tx.query.activityLog.findMany({
          where: eq(activityLog.entityId, client.id),
          orderBy: [desc(activityLog.createdAt)],
          limit: 20,
        })
      ),
    ]);

  const pendingRequests =
    contentReqs.filter((r) => r.status === "pendiente").length +
    adjustmentReqs.filter((r) => r.status === "pendiente").length;

  const statusMeta = CLIENT_STATUS_META[client.status];
  const planOptions = [
    { value: "", label: "Sin plan" },
    ...allPlans.map((plan) => ({ value: plan.id, label: plan.name })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/clients"
        className="w-fit text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        ← Clientes
      </Link>

      <div className={`flex flex-col gap-4 rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {client.businessName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{client.contactEmail}</p>
            {client.contactPhone && (
              <p className="text-sm text-gray-500">{client.contactPhone}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_PILL[statusMeta.color]}`}
            >
              {statusMeta.label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                client.clerkUserId
                  ? "bg-md-teal/10 text-md-teal"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {client.clerkUserId ? "Vinculado" : "Sin reclamar"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t border-gray-100 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Estado
            </span>
            <SelectAndSubmit
              action={updateClientStatus}
              hiddenFields={{ clientId: client.id }}
              name="status"
              defaultValue={client.status}
              options={STATUS_OPTIONS}
              dotColor={statusMeta.color}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Plan
            </span>
            <SelectAndSubmit
              action={updateClientPlan}
              hiddenFields={{ clientId: client.id }}
              name="planId"
              defaultValue={client.planId ?? ""}
              options={planOptions}
            />
          </div>
        </div>

        <details className="border-t border-gray-100 pt-4">
          <summary className="cursor-pointer text-xs font-medium text-md-teal">
            Editar perfil
          </summary>
          <form
            action={updateClientProfile}
            className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="id" value={client.id} />
            <input
              name="businessName"
              defaultValue={client.businessName}
              required
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="contactEmail"
              type="email"
              defaultValue={client.contactEmail}
              required
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="contactPhone"
              defaultValue={client.contactPhone ?? ""}
              placeholder="Teléfono"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-fit rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white hover:bg-md-teal/90"
            >
              Guardar
            </button>
          </form>
        </details>
      </div>

      <details open className={`rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          Campañas ({campaigns.length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {campaigns.length === 0 ? (
            <p className="text-sm text-gray-500">Sin campañas registradas.</p>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                <span className="font-medium text-gray-900">{c.name}</span>
                <span className="text-xs text-gray-500">
                  {c.platform === "meta" ? "Meta Ads" : "Google Ads"} · {c.status}
                </span>
              </div>
            ))
          )}
          <Link
            href={`/admin/campanas?clientId=${client.id}`}
            className="mt-1 w-fit text-xs font-medium text-md-teal hover:underline"
          >
            Gestionar campañas →
          </Link>
        </div>
      </details>

      {(contentReqs.length > 0 || adjustmentReqs.length > 0) && (
        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
          <div>
            <p className="text-sm font-semibold text-gray-900">Solicitudes</p>
            <p className="text-xs text-gray-500">
              {pendingRequests > 0
                ? `${pendingRequests} pendiente${pendingRequests === 1 ? "" : "s"}`
                : "Todas revisadas"}
            </p>
          </div>
          <Link
            href={`/admin/solicitudes?clientId=${client.id}`}
            className="w-fit rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Ver solicitudes →
          </Link>
        </div>
      )}

      <details className={`rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          Calendario de contenido ({contentItems.length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {contentItems.length === 0 ? (
            <p className="text-sm text-gray-500">Sin contenido programado.</p>
          ) : (
            contentItems.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                <span className="font-medium text-gray-900">{item.title}</span>
                <span className="text-xs text-gray-500">
                  {new Date(item.scheduledDate).toLocaleDateString("es-MX")}
                </span>
              </div>
            ))
          )}
          <Link
            href={`/admin/calendario?clientId=${client.id}`}
            className="mt-1 w-fit text-xs font-medium text-md-teal hover:underline"
          >
            Gestionar calendario →
          </Link>
        </div>
      </details>

      <details className={`rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          Conversaciones ({events.length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">Sin conversaciones registradas.</p>
          ) : (
            events.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                <span className="font-medium text-gray-900">
                  {event.contactName ?? event.contactPhone ?? "—"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(event.occurredAt).toLocaleDateString("es-MX")}
                </span>
              </div>
            ))
          )}
          <Link
            href={`/admin/conversaciones?clientId=${client.id}`}
            className="mt-1 w-fit text-xs font-medium text-md-teal hover:underline"
          >
            Gestionar conversaciones →
          </Link>
        </div>
      </details>

      <details open className={`rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          Pendientes internos ({tasks.filter((t) => !t.done).length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          <form action={createClientTask} className="flex gap-2">
            <input type="hidden" name="clientId" value={client.id} />
            <input
              name="title"
              required
              placeholder="Ej. Pedir fotos del local"
              className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white hover:bg-md-teal/90"
            >
              Agregar
            </button>
          </form>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">Sin pendientes.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 border-t border-gray-100 py-2.5 first:border-t-0"
                >
                  <TaskCheckbox
                    action={toggleClientTask}
                    id={task.id}
                    clientId={client.id}
                    done={task.done}
                  />
                  <span
                    className={`flex-1 text-sm ${task.done ? "text-gray-400 line-through" : "text-gray-900"}`}
                  >
                    {task.title}
                  </span>
                  <DeleteButton
                    action={deleteClientTask}
                    id={task.id}
                    hiddenFields={{ clientId: client.id }}
                    confirmMessage="¿Eliminar este pendiente?"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </details>

      <details className={`rounded-2xl bg-white p-6 ${CARD_SHADOW}`}>
        <summary className="cursor-pointer text-sm font-semibold text-gray-900">
          Actividad reciente en el perfil
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">
              Sin cambios registrados directamente sobre este perfil todavía.
            </p>
          ) : (
            recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                <span className="text-gray-700">{entry.summary}</span>
                <span className="text-xs text-gray-400">
                  {entry.actorUsername} ·{" "}
                  {new Date(entry.createdAt).toLocaleDateString("es-MX")}
                </span>
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  );
}
