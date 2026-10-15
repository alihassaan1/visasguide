import { createFileRoute } from "@tanstack/react-router";
import QuickWinsDashboard from "@/pages/admin/QuickWinsDashboard";

export const Route = createFileRoute("/admin/quick-wins")({
  component: QuickWinsDashboard,
});
