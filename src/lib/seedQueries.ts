import type { QueryClient } from "@tanstack/react-query";

/** Seed server-fetched [queryKey, data] pairs into the React Query cache. */
export function seedQueries(qc: QueryClient, entries: unknown) {
  if (typeof entries === "string") { try { entries = JSON.parse(entries); } catch { return; } }
  if (!Array.isArray(entries)) return;
  for (const [key, data] of entries as [unknown[], unknown][]) {
    const state = qc.getQueryState(key);
    const freshShared = key[0] === 'shared' && state?.data !== undefined && !state.isInvalidated && Date.now() - state.dataUpdatedAt < 24 * 60 * 60 * 1000;
    if (!freshShared) qc.setQueryData(key, data);
  }
}
