import { createFileRoute } from "@tanstack/react-router";
import TermsOfService from "@/pages/TermsOfService";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/terms-of-service")({
  head: () => publicHead({ title: "Terms of Service | Visas.Guide", description: "Terms governing the use of Visas.Guide visa information and travel content.", path: "/terms-of-service" }),
  component: TermsOfService,
});
