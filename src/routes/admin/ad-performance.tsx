import { createFileRoute } from "@tanstack/react-router";
import AdPerformanceDashboard from "@/pages/admin/AdPerformanceDashboard";

export const Route = createFileRoute("/admin/ad-performance")({
  component: AdPerformanceDashboard,
});
