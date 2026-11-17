import { createFileRoute } from "@tanstack/react-router";
import Countries from "@/pages/Countries";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/countries/")({
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "countries" } })); return { countryCount: context.queryClient.getQueryData<unknown[]>(["shared", "countries"])?.length }; },
  head: ({ loaderData }) => { const count = loaderData?.countryCount; return publicHead(loaderData ? { title: `Visa Requirements by Country | Browse ${count} Destinations | visas.guide`, description: `Explore visa requirements for ${count} destinations worldwide. Find entry rules, visa-free access, eVisa options and travel documentation for each country.`, path: "/countries" } : undefined); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: Countries,
});
