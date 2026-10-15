import { createFileRoute } from "@tanstack/react-router";
import NewsArticle from "@/pages/NewsArticle";

export const Route = createFileRoute("/blog/$slug")({
  component: NewsArticle,
});
