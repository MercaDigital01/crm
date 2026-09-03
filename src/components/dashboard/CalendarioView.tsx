"use client";

import { useState } from "react";
import {
  ContentMonthCalendar,
  type CalendarContentItem,
} from "./ContentMonthCalendar";

const STATUS_COPY = {
  borrador: "Borrador",
  programado: "Programado",
  publicado: "Publicado",
} as const;

const FORMAT_COPY = {
  reel: "Reel",
  carrusel: "Carrusel",
  imagen: "Imagen",
} as const;

export function CalendarioView({ items }: { items: CalendarContentItem[] }) {
  const [view, setView] = useState<"mes" | "lista">("mes");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1 rounded-full bg-white/10 p-1">
        {(["mes", "lista"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === option
                ? "bg-md-admin-coral text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            {option === "mes" ? "Mes" : "Lista"}
          </button>
        ))}
      </div>

      {view === "mes" ? (
        <div className="admin-card p-4 md:p-6">
          <ContentMonthCalendar items={items} />
        </div>
      ) : (
        <div className="admin-card p-2">
          <div className="flex flex-col divide-y divide-white/10">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-white">
                    {item.title}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-md-admin-rose-muted/70">
                    {new Date(item.scheduledDate).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    · {item.platform}
                    {item.pillar ? ` · ${item.pillar}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/70">
                    {FORMAT_COPY[item.format]}
                  </span>
                  <span className="rounded-full bg-md-admin-gold/20 px-2.5 py-1 text-xs font-medium text-md-admin-gold">
                    {STATUS_COPY[item.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
