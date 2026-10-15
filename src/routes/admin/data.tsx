import { createFileRoute } from "@tanstack/react-router";
import DataManager from "@/pages/admin/DataManager";

export const Route = createFileRoute("/admin/data")({
  component: DataManager,
});
