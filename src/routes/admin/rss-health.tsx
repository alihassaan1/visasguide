import { createFileRoute } from "@tanstack/react-router";
import RSSFeedsHealth from "@/pages/admin/RSSFeedsHealth";

export const Route = createFileRoute("/admin/rss-health")({
  component: RSSFeedsHealth,
});
