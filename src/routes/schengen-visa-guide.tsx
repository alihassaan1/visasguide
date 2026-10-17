import { createFileRoute } from "@tanstack/react-router";
import SchengenVisaGuide from "@/pages/SchengenVisaGuide";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/schengen-visa-guide")({
  head: () => publicHead({ title: "Schengen Visa Guide 2026 | Requirements & How to Apply", description: "Explore Schengen visa requirements, member countries, application steps, fees and travel documentation.", path: "/schengen-visa-guide" }),
  component: SchengenVisaGuide,
});
