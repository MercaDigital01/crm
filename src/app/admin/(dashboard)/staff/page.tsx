import { asc } from "drizzle-orm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EditToggle } from "@/components/admin/EditToggle";
import { staffUsers } from "@/db/schema";
import { withAppUser } from "@/db/session";
import { getAdminSession } from "@/lib/admin-session";
import { requireStaffOrRedirect } from "@/lib/staff";
import { createStaffUser, deleteStaffUser, updateStaffDisplayName } from "./actions";

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
        <h1 className="admin-h1">Cuentas de staff</h1>
        <p className="admin-subtle mt-1 text-sm">
          Cuentas con nombre propio en vez de una contraseña compartida.
          Todas tienen el mismo nivel de acceso — no hay roles por ahora.
        </p>
      </div>

      <form
        action={createStaffUser}
        className="admin-card flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
      >
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-white/60">Usuario</label>
          <input name="username" required />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-white/60">
            Contraseña (mín. 8 caracteres)
          </label>
          <input type="password" name="password" minLength={8} required />
        </div>
        <button
          type="submit"
          className="rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90"
        >
          Crear cuenta
        </button>
      </form>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Nombre para mostrar</th>
              <th className="px-4 py-3">Creada</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-3 font-medium text-white">
                  {account.username}
                  {account.username === session?.username && (
                    <span className="ml-2 rounded-full bg-md-teal/20 px-2 py-0.5 text-[10px] font-medium text-md-teal">
                      Tú
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-md-admin-rose-muted">
                  <EditToggle
                    view={
                      account.displayName || (
                        <span className="text-md-admin-rose-muted/60">
                          Usa el nombre de usuario
                        </span>
                      )
                    }
                    edit={
                      <form
                        action={updateStaffDisplayName}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="id" value={account.id} />
                        <input
                          name="displayName"
                          defaultValue={account.displayName ?? ""}
                          placeholder="Nombre para el saludo"
                          className="text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-md-admin-gold px-3 py-1 text-xs font-medium text-md-admin-card-deep hover:bg-md-admin-gold/90"
                        >
                          Guardar
                        </button>
                      </form>
                    }
                  />
                </td>
                <td className="px-4 py-3 text-md-admin-rose-muted">
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
