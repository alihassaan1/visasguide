import { createFileRoute } from "@tanstack/react-router";
import EtiasNewsHub from "@/pages/etias/EtiasNewsHub";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/etias/news")({
  head: () => publicHead({ title: "ETIAS News & Updates | Latest 2026 Coverage | Visas.Guide", description: "ETIAS launch coverage, fee changes, country rules and official EU announcements.", path: "/etias/news" }),
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "etias-news" } })); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: EtiasNewsHub,
});
