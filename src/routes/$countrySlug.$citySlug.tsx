import { createFileRoute } from "@tanstack/react-router";
import CityPage from "@/pages/CityPage";
import { getCityPageData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";

export const Route = createFileRoute("/$countrySlug/$citySlug")({
  loader: async ({ params, context }) => {
    if (context.queryClient.getQueryData(["city", params.citySlug]) !== undefined) return;
    seedQueries(context.queryClient, await getCityPageData({ data: { slug: params.citySlug } }));
  },
  component: CityPage,
});
