"use client";

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={`flex flex-col gap-3 rounded-2xl bg-white p-6 md:p-8 ${CARD_SHADOW}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
        Algo salió mal
      </span>
      <p className="max-w-md text-sm leading-relaxed text-gray-600">
        {error.message || "Ocurrió un error inesperado. Intenta de nuevo."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="w-fit rounded-full bg-md-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-md-teal/90"
      >
        Reintentar
      </button>
    </div>
  );
}
