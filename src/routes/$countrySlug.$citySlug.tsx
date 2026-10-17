import { createFileRoute } from "@tanstack/react-router";
import CityPage from "@/pages/CityPage";
import { loadPublicDetail } from "@/lib/public-route-data";
import { publicHead } from "@/lib/public-seo";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/$countrySlug/$citySlug")({
  loader: ({ params, context }) => loadPublicDetail(context.queryClient, "city", params.citySlug, params.countrySlug),
  head: ({ loaderData }) => publicHead(loaderData),
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: CityPage,
});
