import { createFileRoute } from "@tanstack/react-router";
import RSSFeedManager from "@/pages/admin/RSSFeedManager";

export const Route = createFileRoute("/admin/rss-feeds")({
  component: RSSFeedManager,
});
