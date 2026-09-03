"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useClientToday } from "@/hooks/useClientToday";

const WEEKDAY_LABEL = ["D", "L", "M", "M", "J", "V", "S"];

export type EditorialItem = {
  id: string;
  scheduledDate: string;
  title: string;
  businessName: string;
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

export function EditorialMonthCalendar({ items }: { items: EditorialItem[] }) {
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
    const map = new Map<string, EditorialItem[]>();
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
        <p className="text-sm font-semibold capitalize text-gray-900">{monthLabel}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!cursor}
            onClick={() =>
              cursor && setManualCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            aria-label="Mes anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
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
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABEL.map((label, i) => (
          <div key={i} className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-gray-400">
            {label}
          </div>
        ))}

        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            if (!day) {
              return <div key={`${weekIndex}-${dayIndex}`} className="min-h-[6rem] rounded-lg bg-gray-50/50" />;
            }
            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const dayItems = itemsByDay.get(key) ?? [];
            const isToday = today ? sameDay(day, today) : false;

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`flex min-h-[6rem] flex-col gap-1 rounded-lg border p-1.5 ${
                  isToday ? "border-md-teal/40 bg-md-teal/5" : "border-gray-100 bg-white"
                }`}
              >
                <span className={`text-[11px] font-medium ${isToday ? "text-md-teal" : "text-gray-400"}`}>
                  {day.getDate()}
                </span>
                <div className="flex flex-col gap-1">
                  {dayItems.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      title={`${item.businessName}: ${item.title}`}
                      className="truncate rounded bg-md-teal/10 px-1.5 py-0.5 text-[10px] font-medium text-md-teal"
                    >
                      {item.businessName}: {item.title}
                    </span>
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[10px] font-medium text-gray-400">
                      +{dayItems.length - 3} más
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
