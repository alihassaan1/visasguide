import { createFileRoute } from "@tanstack/react-router";
import SocialMediaDashboard from "@/pages/admin/SocialMediaDashboard";

export const Route = createFileRoute("/admin/marketing/social")({
  component: SocialMediaDashboard,
});
