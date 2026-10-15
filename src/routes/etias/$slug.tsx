import { createFileRoute } from "@tanstack/react-router";
import EtiasSubPage from "@/pages/etias/EtiasSubPage";

export const Route = createFileRoute("/etias/$slug")({
  component: EtiasSubPage,
});
