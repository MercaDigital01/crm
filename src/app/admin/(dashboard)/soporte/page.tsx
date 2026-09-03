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
        <h1 className="admin-h1">Bitácora de Vista de Soporte</h1>
        <p className="admin-subtle mt-1 text-sm">
          Cada vez que un miembro del equipo entra a la cuenta de un cliente
          en modo soporte queda registrado aquí (
          docs/terminos-de-servicio.md §10.2).
        </p>
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3">Administrador</th>
              <th className="px-4 py-3">Cuenta consultada</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3 text-white">
                  {entry.adminUsername}
                </td>
                <td className="px-4 py-3 text-md-admin-rose-muted">
                  {entry.businessName}
                </td>
                <td className="px-4 py-3 text-md-admin-rose-muted">
                  {new Date(entry.accessedAt).toLocaleString("es-MX")}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-sm text-md-admin-rose-muted"
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
