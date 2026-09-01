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
        className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-500 transition-colors hover:border-md-red/40 hover:bg-md-red/10 hover:text-md-red"
      >
        {label}
      </button>
    </form>
  );
}
