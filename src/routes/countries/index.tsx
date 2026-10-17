import { createFileRoute } from "@tanstack/react-router";
import Countries from "@/pages/Countries";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/countries/")({
  head: () => publicHead({ title: "Visa Requirements by Country | Browse 200+ Visa Destinations | Visas.Guide", description: "Explore visa requirements for 200+ visa destinations worldwide. Find entry rules, visa-free access, eVisa options, and travel documentation for every country.", path: "/countries" }),
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "countries" } })); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: Countries,
});
