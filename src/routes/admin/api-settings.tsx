import { createFileRoute } from "@tanstack/react-router";
import APISettings from "@/pages/admin/APISettings";

export const Route = createFileRoute("/admin/api-settings")({
  component: APISettings,
});
