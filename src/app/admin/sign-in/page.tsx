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
    <div className="flex flex-1 items-center justify-center bg-md-admin-bg px-6 py-16">
      <form
        action={signInAdmin}
        className="admin-card flex w-full max-w-sm flex-col gap-4 p-8"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-2xl bg-md-admin-cream p-2.5">
            <Image
              src="/brand/logo-merca-digital.png"
              alt="Merca Digital"
              width={160}
              height={38}
              className="h-7 w-auto"
              priority
            />
          </span>
          <div>
            <h1 className="font-admin-display text-xl font-semibold text-md-admin-cream">
              Acceso de administrador
            </h1>
            <p className="admin-subtle mt-1 text-sm">
              Solo para el equipo de Merca Digital
            </p>
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={returnPath} />

        {error === "locked" && (
          <p className="rounded-lg bg-md-admin-coral/15 px-3 py-2 text-sm text-md-admin-coral">
            Cuenta bloqueada temporalmente por varios intentos fallidos.
            Intenta de nuevo en unos minutos.
          </p>
        )}
        {error && error !== "locked" && (
          <p className="rounded-lg bg-md-admin-coral/15 px-3 py-2 text-sm text-md-admin-coral">
            Usuario o contraseña incorrectos.
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="username"
            className="text-xs font-medium text-white/60"
          >
            Usuario
          </label>
          <input id="username" name="username" required autoComplete="username" />
        </div>

        <PasswordField />

        <button
          type="submit"
          className="mt-2 rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
