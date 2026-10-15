import { createFileRoute } from "@tanstack/react-router";
import Requirements from "@/pages/Requirements";

export const Route = createFileRoute("/requirements")({
  component: Requirements,
});
