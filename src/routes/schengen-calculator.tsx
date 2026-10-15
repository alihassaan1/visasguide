import { createFileRoute } from "@tanstack/react-router";
import SchengenCalculator from "@/pages/SchengenCalculator";

export const Route = createFileRoute("/schengen-calculator")({
  component: SchengenCalculator,
});
