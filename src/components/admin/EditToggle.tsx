"use client";

import { Pencil, X } from "lucide-react";
import { useState } from "react";

export function EditToggle({
  view,
  edit,
}: {
  view: React.ReactNode;
  edit: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        <div className="flex-1">{edit}</div>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="Cancelar edición"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">{view}</div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Editar"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Pencil size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
