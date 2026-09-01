import { asc } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { staffUsers } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { getAdminSession } from "@/lib/admin-session";
import { requireStaffOrRedirect } from "@/lib/staff";
import { createStaffUser, deleteStaffUser } from "./actions";

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

export default async function AdminStaffPage() {
  await requireStaffOrRedirect("/admin/staff");

  const [accounts, session] = await Promise.all([
    withAppUser((tx) =>
      tx.query.staffUsers.findMany({ orderBy: [asc(staffUsers.createdAt)] })
    ),
    getAdminSession(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Cuentas de staff
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cuentas con nombre propio en vez de una contraseña compartida.
          Todas tienen el mismo nivel de acceso — no hay roles por ahora.
        </p>
      </div>

      <form
        action={createStaffUser}
        className="flex flex-col gap-3 rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 sm:flex-row sm:items-end sm:gap-4"
      >
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Usuario</label>
          <input
            name="username"
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Contraseña (mín. 8 caracteres)
          </label>
          <input
            type="password"
            name="password"
            minLength={8}
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
        >
          Crear cuenta
        </button>
      </form>

      <div className={`overflow-x-auto rounded-2xl bg-white ${CARD_SHADOW}`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Creada</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {account.username}
                  {account.username === session?.username && (
                    <span className="ml-2 rounded-full bg-md-teal/10 px-2 py-0.5 text-[10px] font-medium text-md-teal">
                      Tú
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(account.createdAt).toLocaleDateString("es-MX")}
                </td>
                <td className="px-4 py-3">
                  <DeleteButton
                    action={deleteStaffUser}
                    id={account.id}
                    confirmMessage={`¿Eliminar la cuenta "${account.username}"?`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
