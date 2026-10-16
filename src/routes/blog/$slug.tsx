import { createFileRoute } from "@tanstack/react-router";
import NewsArticle from "@/pages/NewsArticle";
import { getBlogArticleData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    if (context.queryClient.getQueryData(["news-article", params.slug]) !== undefined) return;
    seedQueries(context.queryClient, await getBlogArticleData({ data: { slug: params.slug } }));
  },
  component: NewsArticle,
});
