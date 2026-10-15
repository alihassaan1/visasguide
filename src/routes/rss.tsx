import { createFileRoute } from "@tanstack/react-router";
import RSSFeed from "@/pages/RSSFeed";

export const Route = createFileRoute("/rss")({
  component: RSSFeed,
});
