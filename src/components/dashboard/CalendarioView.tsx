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

const CARD_SHADOW = "shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

export function CalendarioView({ items }: { items: CalendarContentItem[] }) {
  const [view, setView] = useState<"mes" | "lista">("mes");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1 rounded-full bg-gray-100 p-1">
        {(["mes", "lista"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === option
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {option === "mes" ? "Mes" : "Lista"}
          </button>
        ))}
      </div>

      {view === "mes" ? (
        <div className={`rounded-2xl bg-white p-4 md:p-6 ${CARD_SHADOW}`}>
          <ContentMonthCalendar items={items} />
        </div>
      ) : (
        <div className={`rounded-2xl bg-white p-2 ${CARD_SHADOW}`}>
          <div className="flex flex-col divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {new Date(item.scheduledDate).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    · {item.platform}
                    {item.pillar ? ` · ${item.pillar}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {FORMAT_COPY[item.format]}
                  </span>
                  <span className="rounded-full bg-md-teal/10 px-2.5 py-1 text-xs font-medium text-md-teal">
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
