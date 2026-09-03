"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useClientToday } from "@/hooks/useClientToday";

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

const WEEKDAY_LABEL = ["D", "L", "M", "M", "J", "V", "S"];

export type CalendarContentItem = {
  id: string;
  scheduledDate: string;
  title: string;
  platform: string;
  pillar: string | null;
  status: keyof typeof STATUS_COPY;
  format: keyof typeof FORMAT_COPY;
  thumbnailUrl: string | null;
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthMatrix(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function ContentMonthCalendar({
  items,
}: {
  items: CalendarContentItem[];
}) {
  // "Today" depends on the client's clock, which can legitimately differ by
  // a moment between the server render and client hydration — useClientToday
  // resolves it after mount instead of during the render Next.js sends to
  // the server, so both agree on the first paint (nothing highlighted, grid
  // appears a beat after mount). The displayed month defaults to today's
  // once known; `manualCursor` only tracks an explicit prev/next click.
  const today = useClientToday();
  const [manualCursor, setManualCursor] = useState<Date | null>(null);
  const cursor = manualCursor ?? today;

  const weeks = useMemo(
    () => (cursor ? buildMonthMatrix(cursor.getFullYear(), cursor.getMonth()) : []),
    [cursor]
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarContentItem[]>();
    for (const item of items) {
      const d = new Date(item.scheduledDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const bucket = map.get(key) ?? [];
      bucket.push(item);
      map.set(key, bucket);
    }
    return map;
  }, [items]);

  const monthLabel = cursor
    ? cursor.toLocaleDateString("es-MX", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold capitalize text-md-admin-cream">
          {monthLabel}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!cursor}
            onClick={() =>
              cursor && setManualCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            aria-label="Mes anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            disabled={!cursor}
            onClick={() =>
              cursor && setManualCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            aria-label="Mes siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABEL.map((label, i) => (
          <div
            key={i}
            className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-md-admin-rose-muted/70"
          >
            {label}
          </div>
        ))}

        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            if (!day) {
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="min-h-[5.5rem] rounded-lg bg-white/[0.02]"
                />
              );
            }
            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const dayItems = itemsByDay.get(key) ?? [];
            const isToday = today ? sameDay(day, today) : false;

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`flex min-h-[5.5rem] flex-col gap-1 rounded-lg border p-1.5 ${
                  isToday
                    ? "border-md-admin-gold/40 bg-md-admin-gold/10"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <span
                  className={`text-[11px] font-medium ${
                    isToday ? "text-md-admin-gold" : "text-md-admin-rose-muted/70"
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="flex flex-col gap-1">
                  {dayItems.slice(0, 2).map((item) => (
                    <span
                      key={item.id}
                      title={`${item.title} · ${FORMAT_COPY[item.format]} · ${STATUS_COPY[item.status]}`}
                      className="flex items-center gap-1 truncate rounded bg-md-admin-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-md-admin-gold"
                    >
                      {item.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          className="h-3.5 w-3.5 shrink-0 rounded-sm object-cover"
                        />
                      )}
                      <span className="truncate">{item.title}</span>
                    </span>
                  ))}
                  {dayItems.length > 2 && (
                    <span className="text-[10px] font-medium text-md-admin-rose-muted/70">
                      +{dayItems.length - 2} más
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
