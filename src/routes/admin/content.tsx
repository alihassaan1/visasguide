import { createFileRoute } from "@tanstack/react-router";
import ContentManager from "@/pages/admin/ContentManager";

export const Route = createFileRoute("/admin/content")({
  component: ContentManager,
});
