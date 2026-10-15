import { createFileRoute } from "@tanstack/react-router";
import PlatformSettings from "@/pages/admin/PlatformSettings";

export const Route = createFileRoute("/admin/marketing/platforms")({
  component: PlatformSettings,
});
