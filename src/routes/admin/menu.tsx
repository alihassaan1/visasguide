import { createFileRoute } from "@tanstack/react-router";
import MenuManager from "@/pages/admin/MenuManager";

export const Route = createFileRoute("/admin/menu")({
  component: MenuManager,
});
