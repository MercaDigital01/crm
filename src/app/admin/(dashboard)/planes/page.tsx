import { asc } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EditToggle } from "@/components/admin/EditToggle";
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
        <h1 className="text-2xl font-semibold text-gray-900">Planes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Los planes que crees aquí quedan disponibles para asignar en
          Clientes.
        </p>
      </div>

      <form
        action={createPlan}
        className="flex flex-col gap-3 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 sm:flex-row sm:items-end sm:gap-4"
      >
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Nombre del plan
          </label>
          <input
            name="name"
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Precio mensual (MXN)
          </label>
          <input
            type="number"
            name="priceMxn"
            min={0}
            step="0.01"
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Descripción (opcional)
          </label>
          <input
            name="description"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
        >
          Crear plan
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allPlans.map((plan) => (
              <tr key={plan.id}>
                <td colSpan={3} className="px-4 py-3">
                  <EditToggle
                    view={
                      <div className="grid grid-cols-3 gap-2">
                        <p className="font-medium text-gray-900">{plan.name}</p>
                        <p className="text-gray-600">
                          {(plan.priceMxnCents / 100).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })}{" "}
                          / mes
                        </p>
                        <p className="text-gray-600">
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
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                        <input
                          type="number"
                          name="priceMxn"
                          min={0}
                          step="0.01"
                          defaultValue={plan.priceMxnCents / 100}
                          required
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                        <div className="flex gap-2">
                          <input
                            name="description"
                            defaultValue={plan.description ?? ""}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                          />
                          <button
                            type="submit"
                            className="shrink-0 rounded-full bg-md-teal px-3 py-1 text-xs font-medium text-white hover:bg-md-teal/90"
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
                  className="px-4 py-6 text-center text-sm text-gray-500"
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
