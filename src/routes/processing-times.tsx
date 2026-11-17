import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { createFileRoute } from "@tanstack/react-router";
import ProcessingTimes from "@/pages/ProcessingTimes";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/processing-times")({
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "coverage" } })); return { countryCount: context.queryClient.getQueryData<unknown[]>(["shared", "countries"])?.length }; },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  head: () => publicHead({ title: "Global Visa Processing Times & Wait Times 2026 | By Country | Visas.Guide", description: "Compare visa processing times and wait times for tourist, business and student visas by destination.", path: "/processing-times" }),
  component: ProcessingTimes,
});
