import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemaps/$")({
  server: { handlers: { GET: async ({ params }) => {
    const name = params._splat || "";
    if (!/^sitemap-(?:index|\d+|(?:news|blog)-\d+)\.xml$/.test(name)) return new Response("Not found", { status: 404 });
    try {
      const { readStoredSitemap } = await import("@/lib/sitemap-delivery.server");
      return new Response(await readStoredSitemap(name), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
    } catch {
      return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});