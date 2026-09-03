import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCampaignAdjustmentRequests,
  getCampaignsWithStats,
  getClientTasks,
  getContentItems,
  getContentRequests,
  getDeliverables,
  getWhatsappEvents,
} from "@/app/dashboard/data";
import { CLIENT_STATUS_META } from "@/app/dashboard/status";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DeliverableUploadForm } from "@/components/admin/DeliverableUploadForm";
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
  teal: "bg-md-teal/20 text-md-teal",
  gold: "bg-md-admin-gold/20 text-md-admin-gold",
  blue: "bg-blue-400/20 text-blue-300",
  red: "bg-md-admin-coral/20 text-md-admin-coral",
} as const;

const ACTIVITY_PAGE_SIZE = 20;

export default async function AdminClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ activityLimit?: string }>;
}) {
  await requireStaffOrRedirect("/admin/clients");
  const { id } = await params;
  const { activityLimit: activityLimitRaw } = await searchParams;
  const activityLimit = Math.max(
    ACTIVITY_PAGE_SIZE,
    Number(activityLimitRaw) || ACTIVITY_PAGE_SIZE
  );

  const [client, allPlans] = await Promise.all([
    withAppUser((tx) => tx.query.clients.findFirst({ where: eq(clients.id, id) })),
    withAppUser((tx) => tx.query.plans.findMany()),
  ]);

  if (!client) {
    notFound();
  }

  const [campaigns, contentItems, events, tasks, contentReqs, adjustmentReqs, files, recentActivity] =
    await Promise.all([
      getCampaignsWithStats(client.id),
      getContentItems(client.id),
      getWhatsappEvents(client.id),
      getClientTasks(client.id),
      getContentRequests(client.id),
      getCampaignAdjustmentRequests(client.id),
      getDeliverables(client.id),
      withAppUser((tx) =>
        tx.query.activityLog.findMany({
          where: eq(activityLog.entityId, client.id),
          orderBy: [desc(activityLog.createdAt)],
          limit: activityLimit + 1, // +1 to detect "more exist" without a count query
        })
      ),
    ]);

  const hasMoreActivity = recentActivity.length > activityLimit;
  const visibleActivity = recentActivity.slice(0, activityLimit);

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
        className="w-fit text-sm font-medium text-white/50 transition-colors hover:text-white"
      >
        ← Clientes
      </Link>

      <div className="admin-card flex flex-col gap-4 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-admin-display text-2xl font-semibold text-md-admin-cream">
              {client.businessName}
            </h1>
            <p className="admin-subtle mt-1 text-sm">{client.contactEmail}</p>
            {client.contactPhone && (
              <p className="admin-subtle text-sm">{client.contactPhone}</p>
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
                  ? "bg-md-teal/20 text-md-teal"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {client.clerkUserId ? "Vinculado" : "Sin reclamar"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
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
            <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
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

        <details className="border-t border-white/10 pt-4">
          <summary className="cursor-pointer text-xs font-medium text-md-admin-gold">
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
              className="flex-1"
            />
            <input
              name="contactEmail"
              type="email"
              defaultValue={client.contactEmail}
              required
              className="flex-1"
            />
            <input
              name="contactPhone"
              defaultValue={client.contactPhone ?? ""}
              placeholder="Teléfono"
              className="flex-1"
            />
            <button
              type="submit"
              className="w-fit rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep hover:bg-md-admin-gold/90"
            >
              Guardar
            </button>
          </form>
        </details>
      </div>

      <details open className="admin-card">
        <summary className="cursor-pointer text-sm font-semibold text-md-admin-cream">
          Campañas ({campaigns.length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {campaigns.length === 0 ? (
            <p className="admin-subtle text-sm">Sin campañas registradas.</p>
          ) : (
            campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="font-medium text-white">{c.name}</span>
                <span className="text-xs text-md-admin-rose-muted/70">
                  {c.platform === "meta" ? "Meta Ads" : "Google Ads"} · {c.status}
                </span>
              </div>
            ))
          )}
          <Link
            href={`/admin/campanas?clientId=${client.id}`}
            className="mt-1 w-fit text-xs font-medium text-md-admin-gold hover:underline"
          >
            Gestionar campañas →
          </Link>
        </div>
      </details>

      {(contentReqs.length > 0 || adjustmentReqs.length > 0) && (
        <div className="admin-card flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-md-admin-cream">Solicitudes</p>
            <p className="admin-subtle text-xs">
              {pendingRequests > 0
                ? `${pendingRequests} pendiente${pendingRequests === 1 ? "" : "s"}`
                : "Todas revisadas"}
            </p>
          </div>
          <Link
            href={`/admin/solicitudes?clientId=${client.id}`}
            className="w-fit rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Ver solicitudes →
          </Link>
        </div>
      )}

      <details className="admin-card">
        <summary className="cursor-pointer text-sm font-semibold text-md-admin-cream">
          Calendario de contenido ({contentItems.length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {contentItems.length === 0 ? (
            <p className="admin-subtle text-sm">Sin contenido programado.</p>
          ) : (
            contentItems.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="font-medium text-white">{item.title}</span>
                <span className="text-xs text-md-admin-rose-muted/70">
                  {new Date(item.scheduledDate).toLocaleDateString("es-MX")}
                </span>
              </div>
            ))
          )}
          <Link
            href={`/admin/calendario?clientId=${client.id}`}
            className="mt-1 w-fit text-xs font-medium text-md-admin-gold hover:underline"
          >
            Gestionar calendario →
          </Link>
        </div>
      </details>

      <details className="admin-card">
        <summary className="cursor-pointer text-sm font-semibold text-md-admin-cream">
          Conversaciones ({events.length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {events.length === 0 ? (
            <p className="admin-subtle text-sm">Sin conversaciones registradas.</p>
          ) : (
            events.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="font-medium text-white">
                  {event.contactName ?? event.contactPhone ?? "—"}
                </span>
                <span className="text-xs text-md-admin-rose-muted/70">
                  {new Date(event.occurredAt).toLocaleDateString("es-MX")}
                </span>
              </div>
            ))
          )}
          <Link
            href={`/admin/conversaciones?clientId=${client.id}`}
            className="mt-1 w-fit text-xs font-medium text-md-admin-gold hover:underline"
          >
            Gestionar conversaciones →
          </Link>
        </div>
      </details>

      <details open className="admin-card">
        <summary className="cursor-pointer text-sm font-semibold text-md-admin-cream">
          Pendientes internos ({tasks.filter((t) => !t.done).length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          <form action={createClientTask} className="flex gap-2">
            <input type="hidden" name="clientId" value={client.id} />
            <input
              name="title"
              required
              placeholder="Ej. Pedir fotos del local"
              className="w-full max-w-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep hover:bg-md-admin-gold/90"
            >
              Agregar
            </button>
          </form>
          {tasks.length === 0 ? (
            <p className="admin-subtle text-sm">Sin pendientes.</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/10">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 border-t border-white/10 py-2.5 first:border-t-0"
                >
                  <TaskCheckbox
                    action={toggleClientTask}
                    id={task.id}
                    clientId={client.id}
                    done={task.done}
                  />
                  <span
                    className={`flex-1 text-sm ${task.done ? "text-white/30 line-through" : "text-white"}`}
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

      <details className="admin-card">
        <summary className="cursor-pointer text-sm font-semibold text-md-admin-cream">
          Entregables ({files.length})
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {files.length === 0 ? (
            <p className="admin-subtle text-sm">Sin entregables subidos.</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/10">
              {files.map((file) => (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border-t border-white/10 py-2.5 text-sm first:border-t-0 hover:text-md-admin-gold"
                >
                  <span className="text-white">{file.title}</span>
                  <span className="text-xs text-md-admin-rose-muted/70">
                    {new Date(file.createdAt).toLocaleDateString("es-MX")}
                  </span>
                </a>
              ))}
            </div>
          )}
          <DeliverableUploadForm clientId={client.id} />
        </div>
      </details>

      <details className="admin-card">
        <summary className="cursor-pointer text-sm font-semibold text-md-admin-cream">
          Actividad reciente en el perfil
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {visibleActivity.length === 0 ? (
            <p className="admin-subtle text-sm">
              Sin cambios registrados directamente sobre este perfil todavía.
            </p>
          ) : (
            visibleActivity.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-white/80">{entry.summary}</span>
                <span className="text-xs text-md-admin-rose-muted/70">
                  {entry.actorUsername} ·{" "}
                  {new Date(entry.createdAt).toLocaleDateString("es-MX")}
                </span>
              </div>
            ))
          )}
          {hasMoreActivity && (
            <Link
              href={`/admin/clients/${client.id}?activityLimit=${activityLimit + ACTIVITY_PAGE_SIZE}`}
              className="mt-1 w-fit text-xs font-medium text-md-admin-gold hover:underline"
            >
              Ver más →
            </Link>
          )}
        </div>
      </details>
    </div>
  );
}
