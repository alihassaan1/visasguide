import { createFileRoute } from "@tanstack/react-router";
import DeveloperAPISettings from "@/pages/admin/DeveloperAPISettings";

export const Route = createFileRoute("/admin/developer-settings")({
  component: DeveloperAPISettings,
});
