"use client";

import { useMemo, useSyncExternalStore } from "react";

// Cached once per page load, not recomputed on every call — a fresh
// `new Date()` per render would make useSyncExternalStore see a "changed"
// snapshot on every re-render (any cursor change, etc.), which either loops
// or does needless extra work. "Today" not updating live if the tab is left
// open past midnight is an acceptable tradeoff for a calendar's "today"
// highlight.
let cachedTodayKey: string | null = null;
function getTodayKey() {
  cachedTodayKey ??= new Date().toDateString();
  return cachedTodayKey;
}

function subscribe() {
  return () => {};
}

// Server snapshot is always null — the client's clock isn't known during
// SSR, and guessing risks a hydration mismatch if it differs from the
// client's actual "today" by even a moment. Consumers see `null` on the
// first paint (both server-rendered and initial client hydration agree),
// then the real value a beat after mount.
function getServerSnapshot() {
  return null;
}

export function useClientToday(): Date | null {
  const dateKey = useSyncExternalStore(subscribe, getTodayKey, getServerSnapshot);
  return useMemo(() => (dateKey ? new Date(dateKey) : null), [dateKey]);
}
