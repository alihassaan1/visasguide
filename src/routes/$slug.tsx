import { createFileRoute } from "@tanstack/react-router";
import ContentPage from "@/pages/ContentPage";
import { getContentPageData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params, context }) => {
    if (context.queryClient.getQueryData(["content-page", params.slug]) !== undefined) return;
    seedQueries(context.queryClient, await getContentPageData({ data: { slug: params.slug } }));
  },
  component: ContentPage,
});
