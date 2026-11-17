import { describe, expect, it } from "vitest";
import { fetchSitemapRows, sitemapLastmod } from "../../supabase/functions/_shared/sitemap-data";

function fakeClient(failSecond = false) {
  const offsets: number[] = [];
  const query = { select: () => query, eq: () => query, not: () => query, lte: () => query, like: () => query, order: () => query, range: async (offset: number) => {
    offsets.push(offset);
    if (offset === 1000 && failSecond) return { data: null, error: { message: "Unavailable" } };
    return { data: Array.from({ length: offset === 0 ? 1000 : 2 }, (_, i) => ({ id: offset + i })), error: null };
  } };
  return { client: { from: () => query }, offsets };
}

describe("Sitemap public data", () => {
  it("requires published and indexable content in the sitemap query", async () => {
    const filters: [string, unknown][] = [];
    const query = { select: () => query, eq: (column: string, value: unknown) => { filters.push([column, value]); return query; }, order: () => query, range: async () => ({ data: [], error: null }) };
    await fetchSitemapRows({ from: () => query }, "content_pages", "slug", [{ column: "is_published", value: true }, { column: "seo_index", value: true }]);
    expect(filters).toEqual([["is_published", true], ["seo_index", true]]);
  });
  it("loads more than the first 1000 rows", async () => {
    const { client, offsets } = fakeClient();
    const rows = await fetchSitemapRows(client, "content_pages", "id");
    expect(rows.length).toBe(1002);
    expect(offsets).toEqual([0, 1000]);
    expect(rows[1001].id).toBe(1001);
  });
  it("rejects a later-page error rather than publishing a partial sitemap", async () => {
    const { client } = fakeClient(true);
    await expect(fetchSitemapRows(client, "content_pages", "id")).rejects.toThrow("Public sitemap query failed: content_pages");
  });
  it("preserves a page-specific update date", () => {
    expect(sitemapLastmod("2026-06-09T06:26:55.989Z")).toBe("2026-06-09T06:26:55.989Z");
  });
  it("omits missing and invalid dates instead of using today's date", () => {
    expect(sitemapLastmod(null)).toBeUndefined();
    expect(sitemapLastmod("invalid")).toBeUndefined();
  });
});