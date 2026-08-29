import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getViewedClient } from "../data";
import { CLIENT_STATUS_META } from "../status";

const STATUS_PILL = {
  teal: "bg-md-teal/10 text-md-teal",
  gold: "bg-md-gold/10 text-[#a5790a]",
  blue: "bg-md-blue/10 text-md-blue",
  red: "bg-md-red/10 text-md-red",
} as const;

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

export default async function PagoPage() {
  const { userId } = await auth();
  if (!userId && !(await isStaffUser())) {
    redirect("/sign-in");
  }

  const { client: ownClient } = await getViewedClient(userId ?? null);
  if (!ownClient) {
    return <NoClientProfile />;
  }

  const statusMeta = CLIENT_STATUS_META[ownClient.status];

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold text-gray-900">
        Configuración de pago.
      </h1>

      <div className={`flex flex-col gap-3 rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`}>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Estado de tu cuenta
        </span>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUS_PILL[statusMeta.color]}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className={`flex flex-col gap-3 rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`}>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Tarjeta registrada
        </span>
        <p className="max-w-md text-sm leading-relaxed text-gray-500">
          El cobro automático recurrente todavía no está activado — llega en
          la siguiente fase del proyecto. Por ahora, cualquier ajuste a tu
          método de pago se coordina directo con nosotros por WhatsApp.
        </p>
      </div>
    </div>
  );
}
