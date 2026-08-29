import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getContentItems, getViewedClient } from "../data";

const STATUS_COPY = {
  borrador: "Borrador",
  programado: "Programado",
  publicado: "Publicado",
} as const;

const FORMAT_COPY = {
  reel: "Reel",
  carrusel: "Carrusel",
  imagen: "Imagen",
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

  const items = await getContentItems(ownClient.id);

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
        <div className={`rounded-2xl bg-white p-2 ${CARD_SHADOW}`}>
          <div className="flex flex-col divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {new Date(item.scheduledDate).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    · {item.platform}
                    {item.pillar ? ` · ${item.pillar}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {FORMAT_COPY[item.format]}
                  </span>
                  <span className="rounded-full bg-md-teal/10 px-2.5 py-1 text-xs font-medium text-md-teal">
                    {STATUS_COPY[item.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
