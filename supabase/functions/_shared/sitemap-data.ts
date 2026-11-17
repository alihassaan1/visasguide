export type SitemapFilter = { column: string; value: unknown; operator?: string };

/** Never return a partial sitemap after a later page fails. */
export async function fetchSitemapRows(client: any, table: string, columns: string, filters: SitemapFilter[] = [], orderBy?: string) {
  const rows: any[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; ) {
    let query = client.from(table).select(columns);
    for (const filter of filters) {
      if (filter.operator === "not-null") query = query.not(filter.column, "is", null);
      else if (filter.operator === "lte") query = query.lte(filter.column, filter.value);
      else if (filter.operator === "like") query = query.like(filter.column, filter.value);
      else query = query.eq(filter.column, filter.value);
    }
    if (orderBy) query = query.order(orderBy);
    const result = await query.order("id").range(offset, offset + pageSize - 1);
    if (result.error) throw new Error(`Public sitemap query failed: ${table}`);
    if (!result.data?.length) break;
    rows.push(...result.data);
    offset += result.data.length;
    if (result.data.length < pageSize) break;
  }
  return rows;
}

/** Unknown dates stay unknown, never fall back to build or generation time. */
export function sitemapLastmod(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}