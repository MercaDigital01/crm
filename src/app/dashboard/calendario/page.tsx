import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CalendarioView } from "@/components/dashboard/CalendarioView";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { isStaffUser } from "@/lib/staff";
import { getContentItems, getContentRequests, getViewedClient } from "../data";
import { createContentRequest } from "./actions";

const REQUEST_STATUS_COPY = {
  pendiente: { label: "Pendiente", pill: "bg-md-admin-gold/20 text-md-admin-gold" },
  revisado: { label: "Revisado", pill: "bg-md-teal/20 text-md-teal" },
  descartado: { label: "Descartado", pill: "bg-white/10 text-white/50" },
} as const;

export default async function CalendarioPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const [items, requests] = await Promise.all([
    getContentItems(ownClient.id),
    getContentRequests(ownClient.id),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="admin-h1">Tu calendario de contenido.</h1>

      {items.length === 0 ? (
        <p className="max-w-xl text-base leading-relaxed text-md-admin-rose-muted">
          Todavía no hay contenido programado en tu calendario.
        </p>
      ) : (
        <CalendarioView
          items={items.map((item) => ({
            id: item.id,
            scheduledDate: item.scheduledDate,
            title: item.title,
            platform: item.platform,
            pillar: item.pillar,
            status: item.status,
            format: item.format,
            thumbnailUrl: item.thumbnailUrl,
          }))}
        />
      )}

      <div className="admin-card flex flex-col gap-5 md:p-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
            Proponer contenido
          </span>
          <p className="text-sm text-md-admin-rose-muted">
            ¿Tienes una idea para una publicación? Mándala y la revisamos para
            agregarla al calendario.
          </p>
        </div>

        <form
          action={createContentRequest}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
        >
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-white/60">Idea</label>
            <input
              name="title"
              required
              placeholder="Ej. Promo de fin de semana"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-white/60">
              Notas (opcional)
            </label>
            <input
              name="notes"
              placeholder="Detalles, fecha ideal, referencia..."
            />
          </div>
          <SubmitButton className="w-fit shrink-0 rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90">
            Enviar
          </SubmitButton>
        </form>

        {requests.length > 0 && (
          <div className="flex flex-col divide-y divide-white/10 border-t border-white/10 pt-2">
            {requests.map((request) => {
              const meta = REQUEST_STATUS_COPY[request.status];
              return (
                <div
                  key={request.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-white">
                      {request.title}
                    </p>
                    {request.notes && (
                      <p className="text-xs text-md-admin-rose-muted">{request.notes}</p>
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
        )}
      </div>
    </div>
  );
}
