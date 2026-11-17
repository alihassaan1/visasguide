import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "home" } })); return { countryCount: context.queryClient.getQueryData<unknown[]>(["shared", "countries"])?.length }; },
  head: ({ loaderData }) => { const count = loaderData?.countryCount; return publicHead(loaderData ? { title: `Visa Requirements and Travel Guides | visas.guide`, description: `Visa requirements, entry rules, eVisa options and travel guides for ${count} countries. Compare destinations and plan your next trip with visas.guide.`, path: "/" } : undefined); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: Index,
});
