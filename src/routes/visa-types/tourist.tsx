import { createFileRoute } from "@tanstack/react-router";
import TouristVisa from "@/pages/visa-types/TouristVisa";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/visa-types/tourist")({
  head: () => publicHead({ title: "Tourist Visa Guide 2026 | Visas.Guide", description: "Tourist visa requirements, processing times, fees and application tips for travel destinations worldwide.", path: "/visa-types/tourist" }),
  component: TouristVisa,
});
