import type { QueryClient } from "@tanstack/react-query";

/** Seed server-fetched [queryKey, data] pairs into the React Query cache. */
export function seedQueries(qc: QueryClient, entries: unknown) {
  if (!Array.isArray(entries)) return;
  for (const [key, data] of entries as [unknown[], unknown][]) {
    if (qc.getQueryData(key) === undefined) qc.setQueryData(key, data);
  }
}
