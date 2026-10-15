import { createFileRoute } from "@tanstack/react-router";
import BusinessVisa from "@/pages/visa-types/BusinessVisa";

export const Route = createFileRoute("/visa-types/business")({
  component: BusinessVisa,
});
