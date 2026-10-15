import { createFileRoute } from "@tanstack/react-router";
import ContentAgentLogs from "@/pages/admin/ContentAgentLogs";

export const Route = createFileRoute("/admin/content-agent-logs")({
  component: ContentAgentLogs,
});
