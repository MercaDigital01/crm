import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getPayments, getViewedClient } from "../data";
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
  const payments = await getPayments(ownClient.id);

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

      <div className={`flex flex-col gap-3 rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`}>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Historial de pagos
        </span>
        {payments.length === 0 ? (
          <p className="max-w-md text-sm leading-relaxed text-gray-500">
            Todavía no hay pagos registrados en tu cuenta.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {(payment.amountMxnCents / 100).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })}
                  </p>
                  {payment.note && (
                    <p className="text-xs text-gray-500">{payment.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {payment.method && <span>{payment.method}</span>}
                  <span>
                    {new Date(payment.paidAt).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
