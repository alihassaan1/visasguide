import { createFileRoute } from "@tanstack/react-router";
import SEODashboard from "@/pages/admin/SEODashboard";

export const Route = createFileRoute("/admin/seo")({
  component: SEODashboard,
});
