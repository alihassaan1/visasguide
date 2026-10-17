import { createFileRoute } from "@tanstack/react-router";
import BusinessVisa from "@/pages/visa-types/BusinessVisa";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/visa-types/business")({
  head: () => publicHead({ title: "Business Visa Guide 2026 | Visas.Guide", description: "Business visa requirements, documents, fees and application guidance for international business travel.", path: "/visa-types/business" }),
  component: BusinessVisa,
});
