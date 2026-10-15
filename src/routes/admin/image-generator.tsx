import { createFileRoute } from "@tanstack/react-router";
import ImageGenerator from "@/pages/admin/ImageGenerator";

export const Route = createFileRoute("/admin/image-generator")({
  component: ImageGenerator,
});
