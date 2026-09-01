import { asc, desc, ilike, or } from "drizzle-orm";
import { CLIENT_STATUS_META } from "@/app/dashboard/status";
import { EditToggle } from "@/components/admin/EditToggle";
import { SelectAndSubmit } from "@/components/admin/SelectAndSubmit";
import { clients, plans } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";
import {
  createClient,
  enterSupportView,
  updateClientPlan,
  updateClientProfile,
  updateClientStatus,
} from "./actions";

const STATUS_OPTIONS = Object.entries(CLIENT_STATUS_META).map(
  ([value, meta]) => ({ value, label: meta.label })
);

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaffOrRedirect("/admin/clients");

  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const [allClients, allPlans] = await Promise.all([
    withAppUser((tx) =>
      tx.query.clients.findMany({
        where: search
          ? or(
              ilike(clients.businessName, `%${search}%`),
              ilike(clients.contactEmail, `%${search}%`)
            )
          : undefined,
        orderBy: [desc(clients.createdAt)],
      })
    ),
    withAppUser((tx) =>
      tx.query.plans.findMany({ orderBy: [asc(plans.name)] })
    ),
  ]);

  const planOptions = [
    { value: "", label: "Sin plan" },
    ...allPlans.map((plan) => ({ value: plan.id, label: plan.name })),
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Da de alta clientes, ajusta su estado y plan, o entra a su cuenta
          en modo soporte.
        </p>
      </div>

      <form
        action={createClient}
        className="flex flex-col gap-3 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 sm:flex-row sm:items-end sm:gap-4"
      >
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Nombre del negocio
          </label>
          <input
            name="businessName"
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Correo del cliente
          </label>
          <input
            name="contactEmail"
            type="email"
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Teléfono (opcional)
          </label>
          <input
            name="contactPhone"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
        >
          Crear perfil
        </button>
      </form>

      <div className="flex flex-col gap-4">
        <form action="/admin/clients" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre o correo…"
            className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            Buscar
          </button>
        </form>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Negocio</th>
                <th className="px-4 py-3">Vinculado</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Soporte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allClients.map((client) => (
                <tr key={client.id}>
                  <td className="min-w-[16rem] px-4 py-3">
                    <EditToggle
                      view={
                        <div>
                          <p className="font-medium text-gray-900">
                            {client.businessName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {client.contactEmail}
                          </p>
                        </div>
                      }
                      edit={
                        <form
                          action={updateClientProfile}
                          className="flex flex-col gap-1.5"
                        >
                          <input type="hidden" name="id" value={client.id} />
                          <input
                            name="businessName"
                            defaultValue={client.businessName}
                            required
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          />
                          <input
                            name="contactEmail"
                            type="email"
                            defaultValue={client.contactEmail}
                            required
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          />
                          <input
                            name="contactPhone"
                            defaultValue={client.contactPhone ?? ""}
                            placeholder="Teléfono"
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          />
                          <button
                            type="submit"
                            className="w-fit rounded-full bg-md-teal px-3 py-1 text-xs font-medium text-white hover:bg-md-teal/90"
                          >
                            Guardar
                          </button>
                        </form>
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        client.clerkUserId
                          ? "bg-md-teal/10 text-md-teal"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {client.clerkUserId ? "Vinculado" : "Sin reclamar"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SelectAndSubmit
                      action={updateClientStatus}
                      hiddenFields={{ clientId: client.id }}
                      name="status"
                      defaultValue={client.status}
                      options={STATUS_OPTIONS}
                      dotColor={CLIENT_STATUS_META[client.status].color}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <SelectAndSubmit
                      action={updateClientPlan}
                      hiddenFields={{ clientId: client.id }}
                      name="planId"
                      defaultValue={client.planId ?? ""}
                      options={planOptions}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <form action={enterSupportView}>
                      <input type="hidden" name="clientId" value={client.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        Entrar como cliente
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {allClients.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    No se encontraron clientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
