import { createFileRoute } from "@tanstack/react-router";
import EditorialPolicy from "@/pages/EditorialPolicy";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/editorial-policy")({
  head: () => publicHead({ title: "Editorial Policy | Visas.Guide", description: "Our editorial standards, fact-checking process and approach to accurate visa and travel information.", path: "/editorial-policy" }),
  component: EditorialPolicy,
});
