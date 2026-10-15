import { createFileRoute } from "@tanstack/react-router";
import AIContentStudio from "@/pages/admin/AIContentStudio";

export const Route = createFileRoute("/admin/ai-content-studio")({
  component: AIContentStudio,
});
