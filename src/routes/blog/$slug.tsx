import { createFileRoute } from "@tanstack/react-router";
import NewsArticle from "@/pages/NewsArticle";
import { loadPublicDetail } from "@/lib/public-route-data";
import { publicHead } from "@/lib/public-seo";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params, context }) => loadPublicDetail(context.queryClient, "blog", params.slug),
  head: ({ loaderData }) => publicHead(loaderData),
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: NewsArticle,
});
