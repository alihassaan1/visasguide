import { createFileRoute } from "@tanstack/react-router";
import GuidePage from "@/pages/GuidePage";
import { loadPublicDetail } from "@/lib/public-route-data";
import { publicHead } from "@/lib/public-seo";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params, context }) => loadPublicDetail(context.queryClient, "guide", params.slug),
  head: ({ loaderData }) => publicHead(loaderData),
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: GuidePage,
});
