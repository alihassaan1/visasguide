import { createFileRoute } from "@tanstack/react-router";
import EditorialPolicy from "@/pages/EditorialPolicy";

export const Route = createFileRoute("/editorial-policy")({
  component: EditorialPolicy,
});
