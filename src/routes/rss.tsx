import { createFileRoute } from "@tanstack/react-router";
import RSSFeed from "@/pages/RSSFeed";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/rss")({
  head: () => publicHead({ title: "RSS Feed | Subscribe to Visas.Guide Updates", description: "Subscribe to visa news, travel guides and immigration updates in your RSS reader.", path: "/rss" }),
  component: RSSFeed,
});
