import { createFileRoute } from "@tanstack/react-router";
import NewsPage from "@/pages/NewsPage";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/blog/")({
  head: () => publicHead({ title: "Latest Visa News & Immigration Updates 2026 | Visas.Guide Blog", description: "Stay informed with the latest visa policy changes, travel restrictions, immigration updates, and border news from around the world.", path: "/blog" }),
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "blog" } })); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: NewsPage,
});
