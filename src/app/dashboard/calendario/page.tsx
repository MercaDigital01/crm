import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CalendarioView } from "@/components/dashboard/CalendarioView";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getContentItems, getContentRequests, getViewedClient } from "../data";
import { createContentRequest } from "./actions";

const REQUEST_STATUS_COPY = {
  pendiente: { label: "Pendiente", pill: "bg-md-gold/10 text-[#a5790a]" },
  revisado: { label: "Revisado", pill: "bg-md-teal/10 text-md-teal" },
  descartado: { label: "Descartado", pill: "bg-gray-100 text-gray-500" },
} as const;

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

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
      <h1 className="text-2xl font-semibold text-gray-900">
        Tu calendario de contenido.
      </h1>

      {items.length === 0 ? (
        <p className="max-w-xl text-base leading-relaxed text-gray-500">
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

      <div className={`flex flex-col gap-5 rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`}>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Proponer contenido
          </span>
          <p className="text-sm text-gray-500">
            ¿Tienes una idea para una publicación? Mándala y la revisamos para
            agregarla al calendario.
          </p>
        </div>

        <form
          action={createContentRequest}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
        >
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Idea</label>
            <input
              name="title"
              required
              placeholder="Ej. Promo de fin de semana"
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Notas (opcional)
            </label>
            <input
              name="notes"
              placeholder="Detalles, fecha ideal, referencia..."
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-fit shrink-0 rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
          >
            Enviar
          </button>
        </form>

        {requests.length > 0 && (
          <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100 pt-2">
            {requests.map((request) => {
              const meta = REQUEST_STATUS_COPY[request.status];
              return (
                <div
                  key={request.id}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {request.title}
                    </p>
                    {request.notes && (
                      <p className="text-xs text-gray-500">{request.notes}</p>
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
