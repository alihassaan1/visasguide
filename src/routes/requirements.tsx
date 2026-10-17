import { createFileRoute } from "@tanstack/react-router";
import Requirements from "@/pages/Requirements";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/requirements")({
  head: () => publicHead({ title: "Visa Requirements & Documents | Visas.Guide", description: "Explore visa application documents, passport requirements, financial proof and travel insurance requirements.", path: "/requirements" }),
  component: Requirements,
});
