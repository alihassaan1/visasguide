import { createFileRoute } from "@tanstack/react-router";
import EtiasCountryPage from "@/pages/etias/EtiasCountryPage";
import { loadPublicDetail } from "@/lib/public-route-data";
import { publicHead } from "@/lib/public-seo";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/etias/for/$countrySlug")({
  loader: ({ params, context }) => loadPublicDetail(context.queryClient, "etias-country", params.countrySlug),
  head: ({ loaderData }) => publicHead(loaderData),
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: EtiasCountryPage,
});
