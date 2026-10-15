import { createFileRoute } from "@tanstack/react-router";
import ContentPage from "@/pages/ContentPage";

export const Route = createFileRoute("/$slug")({
  component: ContentPage,
});
