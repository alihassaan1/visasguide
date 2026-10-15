import { createFileRoute } from "@tanstack/react-router";
import AgentDashboard from "@/pages/admin/AgentDashboard";

export const Route = createFileRoute("/admin/agent")({
  component: AgentDashboard,
});
