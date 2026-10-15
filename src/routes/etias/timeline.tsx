import { createFileRoute } from "@tanstack/react-router";
import EtiasTimelinePage from "@/pages/etias/EtiasTimelinePage";

export const Route = createFileRoute("/etias/timeline")({
  component: EtiasTimelinePage,
});
