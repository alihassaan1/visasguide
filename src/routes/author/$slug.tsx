import { createFileRoute } from "@tanstack/react-router";
import AuthorPage from "@/pages/AuthorPage";
import { loadPublicDetail } from "@/lib/public-route-data";
import { publicHead } from "@/lib/public-seo";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/author/$slug")({
  loader: ({ params, context }) => loadPublicDetail(context.queryClient, "author", params.slug),
  head: ({ loaderData }) => publicHead(loaderData),
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: AuthorPage,
});
