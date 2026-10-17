import { createFileRoute } from "@tanstack/react-router";
import VisaRequirements from "@/pages/VisaRequirements";
import { loadPublicDetail } from "@/lib/public-route-data";
import { publicHead } from "@/lib/public-seo";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/visa-requirements/$slug")({
  loader: ({ params, context }) => loadPublicDetail(context.queryClient, "visa", params.slug),
  head: ({ loaderData }) => publicHead(loaderData),
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: VisaRequirements,
});
