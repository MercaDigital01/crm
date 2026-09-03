"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="admin-card flex flex-col gap-3 md:p-8">
      <span className="text-xs font-medium uppercase tracking-wide text-md-admin-rose-muted/70">
        Algo salió mal
      </span>
      <p className="max-w-md text-sm leading-relaxed text-md-admin-rose-muted">
        {error.message || "Ocurrió un error inesperado. Intenta de nuevo."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="w-fit rounded-full bg-md-admin-gold px-4 py-2 text-sm font-medium text-md-admin-card-deep transition-colors hover:bg-md-admin-gold/90"
      >
        Reintentar
      </button>
    </div>
  );
}
