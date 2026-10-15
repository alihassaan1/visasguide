import { createFileRoute } from "@tanstack/react-router";
import SiteSettings from "@/pages/admin/SiteSettings";

export const Route = createFileRoute("/admin/settings")({
  component: SiteSettings,
});
