import { createFileRoute } from "@tanstack/react-router";
import PassportRankings from "@/pages/PassportRankings";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/passport-index")({
  head: () => publicHead({ title: "Passport Index 2026 | World Passport Rankings & Visa-Free Score | Visas.Guide", description: "Compare passports ranked by visa-free access and travel freedom. Explore visa-free countries, passport scores and global mobility rankings.", path: "/passport-index" }),
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "passport-index" } })); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: PassportRankings,
});
