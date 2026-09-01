"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_OPTIONS = [7, 30, 90] as const;
type RangeDays = (typeof RANGE_OPTIONS)[number];

export type CampaignStatPoint = {
  statDate: string;
  impressions: number;
  clicks: number;
  spendMxnCents: number;
  conversions: number;
};

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sumPeriod(stats: CampaignStatPoint[], start: number, end: number) {
  let impressions = 0;
  let clicks = 0;
  let spendMxnCents = 0;
  let conversions = 0;
  for (const s of stats) {
    const t = new Date(s.statDate).getTime();
    if (t < start || t >= end) continue;
    impressions += s.impressions;
    clicks += s.clicks;
    spendMxnCents += s.spendMxnCents;
    conversions += s.conversions;
  }
  return { impressions, clicks, spendMxnCents, conversions };
}

function formatDelta(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? null : { pct: null as number | null, isUp: true };
  }
  const pct = ((current - previous) / previous) * 100;
  return { pct, isUp: pct >= 0 };
}

function DeltaLabel({ current, previous }: { current: number; previous: number }) {
  const delta = formatDelta(current, previous);
  if (!delta) {
    return <span className="text-[11px] text-gray-400">Sin comparación</span>;
  }
  const Icon = delta.isUp ? ArrowUp : ArrowDown;
  return (
    <span className="flex items-center gap-0.5 text-[11px] font-medium text-gray-500">
      <Icon size={11} strokeWidth={2.5} />
      {delta.pct === null
        ? "Nuevo este periodo"
        : `${Math.abs(delta.pct).toFixed(0)}% vs. periodo anterior`}
    </span>
  );
}

function bucketSpend(stats: CampaignStatPoint[], days: RangeDays, start: number, end: number) {
  const bucketCount = days === 7 ? 7 : 10;
  const bucketSizeMs = (end - start) / bucketCount;
  const buckets = Array.from({ length: bucketCount }, () => 0);
  for (const s of stats) {
    const t = new Date(s.statDate).getTime();
    if (t < start || t >= end) continue;
    let idx = Math.floor((t - start) / bucketSizeMs);
    if (idx >= bucketCount) idx = bucketCount - 1;
    if (idx < 0) continue;
    buckets[idx] += s.spendMxnCents;
  }
  return buckets;
}

export function CampaignStatsPanel({ stats }: { stats: CampaignStatPoint[] }) {
  const [range, setRange] = useState<RangeDays>(30);

  const { current, previous, chartBuckets } = useMemo(() => {
    const todayEnd = startOfDay(new Date()).getTime() + DAY_MS;
    const currentStart = todayEnd - range * DAY_MS;
    const previousStart = currentStart - range * DAY_MS;

    return {
      current: sumPeriod(stats, currentStart, todayEnd),
      previous: sumPeriod(stats, previousStart, currentStart),
      chartBuckets: bucketSpend(stats, range, currentStart, todayEnd),
    };
  }, [stats, range]);

  const currentCtr = current.impressions > 0 ? (current.clicks / current.impressions) * 100 : 0;
  const previousCtr = previous.impressions > 0 ? (previous.clicks / previous.impressions) * 100 : 0;
  const maxBucket = Math.max(1, ...chartBuckets);

  return (
    <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
          Tendencia
        </span>
        <div className="flex gap-1 rounded-full bg-gray-100 p-0.5">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                range === option
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Impresiones
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {current.impressions.toLocaleString("es-MX")}
          </span>
          <DeltaLabel current={current.impressions} previous={previous.impressions} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Clics
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {current.clicks.toLocaleString("es-MX")}
          </span>
          <DeltaLabel current={current.clicks} previous={previous.clicks} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Gasto
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {(current.spendMxnCents / 100).toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}
          </span>
          <DeltaLabel current={current.spendMxnCents} previous={previous.spendMxnCents} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            CTR
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {currentCtr.toFixed(2)}%
          </span>
          <DeltaLabel current={currentCtr} previous={previousCtr} />
        </div>
      </div>

      <div className="grid items-end gap-1" style={{ gridTemplateColumns: `repeat(${chartBuckets.length}, 1fr)`, height: 56 }}>
        {chartBuckets.map((value, i) => (
          <div
            key={i}
            title={(value / 100).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
            className={`w-full rounded-t ${value === 0 ? "bg-gray-100" : "bg-md-teal/70"}`}
            style={{ height: `${value === 0 ? 6 : Math.max(10, (value / maxBucket) * 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
