"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex w-fit items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 print:hidden"
    >
      <Download size={16} strokeWidth={2} />
      Descargar reporte
    </button>
  );
}
