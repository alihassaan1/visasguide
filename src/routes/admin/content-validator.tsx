import { createFileRoute } from "@tanstack/react-router";
import ContentValidator from "@/pages/admin/ContentValidator";

export const Route = createFileRoute("/admin/content-validator")({
  component: ContentValidator,
});
