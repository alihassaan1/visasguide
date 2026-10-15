import { createFileRoute } from "@tanstack/react-router";
import AffiliateManager from "@/pages/admin/AffiliateManager";

export const Route = createFileRoute("/admin/affiliate-manager")({
  component: AffiliateManager,
});
