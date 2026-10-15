import { createFileRoute } from "@tanstack/react-router";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsDashboard,
});
