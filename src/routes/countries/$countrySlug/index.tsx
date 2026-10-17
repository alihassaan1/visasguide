import { createFileRoute } from "@tanstack/react-router";
import CountryGuide from "@/pages/CountryGuide";
import { loadPublicDetail } from "@/lib/public-route-data";
import { publicHead } from "@/lib/public-seo";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/countries/$countrySlug/")({
  loader: ({ params, context }) => loadPublicDetail(context.queryClient, "country", params.countrySlug),
  head: ({ loaderData }) => publicHead(loaderData),
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: CountryGuide,
});
