import { createFileRoute } from "@tanstack/react-router";
import VisaSearch from "@/pages/VisaSearch";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/visa-search")({
  head: () => publicHead({ title: "Interactive World Visa Map | Visas.Guide", description: "Explore visa requirements worldwide by country, processing times and travel documentation.", path: "/visa-search" }),
  component: VisaSearch,
});
