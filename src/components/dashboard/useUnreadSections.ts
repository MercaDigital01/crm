"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_PREFIX = "md_last_seen_";
const SYNC_EVENT = "md-unread-sections-updated";

export type ActivityTimestamps = Record<string, string | null>;

function computeUnreadKey(latestActivity: ActivityTimestamps): string {
  const unreadHrefs: string[] = [];
  for (const [href, latest] of Object.entries(latestActivity)) {
    if (!latest) continue;
    const lastSeen = window.localStorage.getItem(STORAGE_PREFIX + href);
    if (!lastSeen || new Date(latest).getTime() > Number(lastSeen)) {
      unreadHrefs.push(href);
    }
  }
  return unreadHrefs.join(",");
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SYNC_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SYNC_EVENT, callback);
  };
}

// Server/first-hydration snapshot is always "nothing unread" — localStorage
// only exists client-side, so badges appear a beat after mount rather than
// risking a hydration mismatch.
function getServerSnapshot() {
  return "";
}

export function useUnreadSections(latestActivity: ActivityTimestamps) {
  const key = useSyncExternalStore(
    subscribe,
    () => computeUnreadKey(latestActivity),
    getServerSnapshot
  );
  const unread = useMemo(() => new Set(key ? key.split(",") : []), [key]);

  const markSeen = useCallback((href: string) => {
    window.localStorage.setItem(STORAGE_PREFIX + href, Date.now().toString());
    window.dispatchEvent(new Event(SYNC_EVENT));
  }, []);

  return { unread, markSeen };
}
