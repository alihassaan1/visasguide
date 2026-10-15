import { createFileRoute } from "@tanstack/react-router";
import RSSMonitoringDashboard from "@/pages/admin/RSSMonitoringDashboard";

export const Route = createFileRoute("/admin/rss-monitoring")({
  component: RSSMonitoringDashboard,
});
