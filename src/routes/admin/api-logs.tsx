import { createFileRoute } from "@tanstack/react-router";
import APILogs from "@/pages/admin/APILogs";

export const Route = createFileRoute("/admin/api-logs")({
  component: APILogs,
});
