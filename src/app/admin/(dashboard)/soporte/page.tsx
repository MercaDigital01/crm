import { desc, eq } from "drizzle-orm";
import { clients, supportAccessLog } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { requireStaffOrRedirect } from "@/lib/staff";

export default async function AdminSoportePage() {
  await requireStaffOrRedirect("/admin/soporte");

  const entries = await withAppUser((tx) =>
    tx
      .select({
        id: supportAccessLog.id,
        adminUsername: supportAccessLog.adminUsername,
        accessedAt: supportAccessLog.accessedAt,
        businessName: clients.businessName,
      })
      .from(supportAccessLog)
      .innerJoin(clients, eq(supportAccessLog.targetClientId, clients.id))
      .orderBy(desc(supportAccessLog.accessedAt))
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Bitácora de Vista de Soporte
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cada vez que un miembro del equipo entra a la cuenta de un cliente
          en modo soporte queda registrado aquí (
          docs/terminos-de-servicio.md §10.2).
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Administrador</th>
              <th className="px-4 py-3">Cuenta consultada</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3 text-gray-900">
                  {entry.adminUsername}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {entry.businessName}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(entry.accessedAt).toLocaleString("es-MX")}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Todavía no hay accesos en modo soporte registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
