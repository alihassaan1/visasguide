/**
 * Paginates through a Supabase query in 1000-row chunks to bypass the
 * PostgREST `max_rows` cap. Returns all matching rows concatenated.
 *
 * Usage:
 *   const rows = await fetchAllRows((from, to) =>
 *     supabase.from('analytics_events')
 *       .select('referrer_source')
 *       .gte('created_at', start)
 *       .range(from, to)
 *   );
 */
export async function fetchAllRows<T = any>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>,
  pageSize = 1000,
  hardCap = 500000
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  while (from < hardCap) {
    const to = from + pageSize - 1;
    const { data, error } = await buildQuery(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}
