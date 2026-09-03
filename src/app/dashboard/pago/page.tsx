import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoClientProfile } from "@/components/dashboard/NoClientProfile";
import { isStaffUser } from "@/lib/staff";
import { getPayments, getViewedClient } from "../data";
import { CLIENT_STATUS_META } from "../status";

const STATUS_PILL = {
  teal: "bg-md-teal/20 text-md-teal",
  gold: "bg-md-admin-gold/20 text-md-admin-gold",
  blue: "bg-blue-400/20 text-blue-300",
  red: "bg-md-admin-coral/20 text-md-admin-coral",
} as const;

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
      <h1 className="admin-h1">Configuración de pago.</h1>

      <div className="admin-card flex flex-col gap-3 md:p-8">
        <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
          Estado de tu cuenta
        </span>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUS_PILL[statusMeta.color]}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="admin-card flex flex-col gap-3 md:p-8">
        <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
          Tarjeta registrada
        </span>
        <p className="max-w-md text-sm leading-relaxed text-md-admin-rose-muted">
          El cobro automático recurrente todavía no está activado — llega en
          la siguiente fase del proyecto. Por ahora, cualquier ajuste a tu
          método de pago se coordina directo con nosotros por WhatsApp.
        </p>
      </div>

      <div className="admin-card flex flex-col gap-3 md:p-8">
        <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
          Historial de pagos
        </span>
        {payments.length === 0 ? (
          <p className="max-w-md text-sm leading-relaxed text-md-admin-rose-muted">
            Todavía no hay pagos registrados en tu cuenta.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-white/10">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-white">
                    {(payment.amountMxnCents / 100).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })}
                  </p>
                  {payment.note && (
                    <p className="text-xs text-md-admin-rose-muted">{payment.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-md-admin-rose-muted/70">
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
