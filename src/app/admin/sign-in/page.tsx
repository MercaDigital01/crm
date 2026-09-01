import Image from "next/image";
import { redirect } from "next/navigation";
import { PasswordField } from "@/components/admin/PasswordField";
import { getAdminSession } from "@/lib/admin-session";
import { signInAdmin } from "./actions";

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; error?: string }>;
}) {
  const { redirect_url, error } = await searchParams;

  if (await getAdminSession()) {
    redirect(
      redirect_url && redirect_url.startsWith("/admin")
        ? redirect_url
        : "/admin/clients"
    );
  }

  const returnPath =
    redirect_url && redirect_url.startsWith("/admin")
      ? redirect_url
      : "/admin/clients";

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16 text-gray-900">
      <form
        action={signInAdmin}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/brand/logo-merca-digital.png"
            alt="Merca Digital"
            width={160}
            height={38}
            className="h-8 w-auto"
            priority
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Acceso de administrador
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Solo para el equipo de Merca Digital
            </p>
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={returnPath} />

        {error === "locked" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Cuenta bloqueada temporalmente por varios intentos fallidos.
            Intenta de nuevo en unos minutos.
          </p>
        )}
        {error && error !== "locked" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Usuario o contraseña incorrectos.
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="username"
            className="text-xs font-medium text-gray-600"
          >
            Usuario
          </label>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <PasswordField />

        <button
          type="submit"
          className="mt-2 rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
