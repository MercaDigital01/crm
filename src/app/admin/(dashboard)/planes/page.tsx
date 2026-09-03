import { asc } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EditToggle } from "@/components/admin/EditToggle";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { plans } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import { createPlan, deletePlan, updatePlan } from "./actions";

export default async function AdminPlanesPage() {
  await requireStaffOrRedirect("/admin/planes");

  const allPlans = await withAppUser((tx) =>
    tx.query.plans.findMany({ orderBy: [asc(plans.priceMxnCents)] })
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="admin-h1">Planes</h1>
        <p className="admin-subtle mt-1 text-sm">
          Los planes que crees aquí quedan disponibles para asignar en
          Clientes.
        </p>
      </div>

      <form
        action={createPlan}
        className="admin-card flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
      >
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-white/60">
            Nombre del plan
          </label>
          <input name="name" required />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-white/60">
            Precio mensual (MXN)
          </label>
          <input type="number" name="priceMxn" min={0} step="0.01" required />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-white/60">
            Descripción (opcional)
          </label>
          <input name="description" />
        </div>
        <SubmitButton className="rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90">
          Crear plan
        </SubmitButton>
      </form>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {allPlans.map((plan) => (
              <tr key={plan.id}>
                <td colSpan={3} className="px-4 py-3">
                  <EditToggle
                    key={JSON.stringify(plan)}
                    view={
                      <div className="grid grid-cols-3 gap-2">
                        <p className="font-medium text-white">{plan.name}</p>
                        <p className="text-md-admin-rose-muted">
                          {(plan.priceMxnCents / 100).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })}{" "}
                          / mes
                        </p>
                        <p className="text-md-admin-rose-muted">
                          {plan.description ?? "—"}
                        </p>
                      </div>
                    }
                    edit={
                      <form
                        action={updatePlan}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                      >
                        <input type="hidden" name="id" value={plan.id} />
                        <input
                          name="name"
                          defaultValue={plan.name}
                          required
                          className="text-xs"
                        />
                        <input
                          type="number"
                          name="priceMxn"
                          min={0}
                          step="0.01"
                          defaultValue={plan.priceMxnCents / 100}
                          required
                          className="text-xs"
                        />
                        <div className="flex gap-2">
                          <input
                            name="description"
                            defaultValue={plan.description ?? ""}
                            className="w-full text-xs"
                          />
                          <button
                            type="submit"
                            className="shrink-0 rounded-full bg-md-admin-gold px-3 py-1 text-xs font-medium text-md-admin-card-deep hover:bg-md-admin-gold/90"
                          >
                            Guardar
                          </button>
                        </div>
                      </form>
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <DeleteButton
                    action={deletePlan}
                    id={plan.id}
                    confirmMessage={`¿Eliminar el plan "${plan.name}"?`}
                  />
                </td>
              </tr>
            ))}
            {allPlans.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-md-admin-rose-muted"
                >
                  Todavía no hay planes creados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
