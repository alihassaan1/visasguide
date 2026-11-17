import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: { handlers: { GET: async () => {
    try {
      const { readStoredSitemap } = await import("@/lib/sitemap-delivery.server");
      return new Response(await readStoredSitemap("sitemap-index.xml"), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
    } catch {
      return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  } } },
});