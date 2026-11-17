import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/about")({
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "coverage" } })); return { countryCount: context.queryClient.getQueryData<unknown[]>(["shared", "countries"])?.length }; },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  head: ({ loaderData }) => publicHead({ title: "About Visas.Guide | Trusted Visa Information", description: `Learn about visas.guide and our team helping travelers navigate visa requirements for ${loaderData?.countryCount || "all"} countries worldwide.`, path: "/about" }),
  component: About,
});
