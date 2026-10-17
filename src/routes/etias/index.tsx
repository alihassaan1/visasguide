import { createFileRoute } from "@tanstack/react-router";
import EtiasHub from "@/pages/etias/EtiasHub";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/etias/")({
  head: () => publicHead({ title: "ETIAS 2026 | Complete Travel Authorisation Guide | Visas.Guide", description: "ETIAS eligibility, application steps, fees, validity and launch information for travel to Europe.", path: "/etias" }),
  component: EtiasHub,
});
