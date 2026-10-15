import { createFileRoute } from "@tanstack/react-router";
import DeveloperAgent from "@/pages/admin/DeveloperAgent";

export const Route = createFileRoute("/admin/developer-agent")({
  component: DeveloperAgent,
});
