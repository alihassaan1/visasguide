import { createFileRoute } from "@tanstack/react-router";
import CountryGuide from "@/pages/CountryGuide";
import { getCountryGuideData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";

export const Route = createFileRoute("/countries/$countrySlug/")({
  loader: async ({ params, context }) => {
    if (context.queryClient.getQueryData(["country-guide-content", params.countrySlug]) !== undefined) return;
    seedQueries(context.queryClient, await getCountryGuideData({ data: { slug: params.countrySlug } }));
  },
  component: CountryGuide,
});
