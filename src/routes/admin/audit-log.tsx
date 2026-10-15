import { createFileRoute } from "@tanstack/react-router";
import AuditLog from "@/pages/admin/AuditLog";

export const Route = createFileRoute("/admin/audit-log")({
  component: AuditLog,
});
