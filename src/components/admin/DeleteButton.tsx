"use client";

export function DeleteButton({
  action,
  id,
  hiddenFields,
  confirmMessage = "¿Seguro que quieres eliminar esto? No se puede deshacer.",
  label = "Eliminar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  hiddenFields?: Record<string, string>;
  confirmMessage?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      <button
        type="submit"
        className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 transition-colors hover:border-md-admin-coral/50 hover:bg-md-admin-coral/10 hover:text-md-admin-coral"
      >
        {label}
      </button>
    </form>
  );
}
