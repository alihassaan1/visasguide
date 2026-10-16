import type { QueryClient } from "@tanstack/react-query";

/** Seed server-fetched [queryKey, data] pairs into the React Query cache. */
export function seedQueries(qc: QueryClient, entries: [readonly unknown[], unknown][]) {
  for (const [key, data] of entries) {
    if (qc.getQueryData(key) === undefined) qc.setQueryData(key, data);
  }
}
