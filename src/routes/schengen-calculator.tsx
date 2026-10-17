import { createFileRoute } from "@tanstack/react-router";
import SchengenCalculator from "@/pages/SchengenCalculator";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/schengen-calculator")({
  head: () => publicHead({ title: "Schengen 90/180 Day Calculator 2026 | Visas.Guide", description: "Track your Schengen stays, calculate remaining days and check the 90-in-180-day limit.", path: "/schengen-calculator" }),
  component: SchengenCalculator,
});
