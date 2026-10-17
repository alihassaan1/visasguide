import { createFileRoute } from "@tanstack/react-router";
import AffiliateDisclosure from "@/pages/AffiliateDisclosure";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/affiliate-disclosure")({
  head: () => publicHead({ title: "Affiliate Disclosure | Visas.Guide", description: "Learn how affiliate partnerships support Visas.Guide and how we disclose commercial links.", path: "/affiliate-disclosure" }),
  component: AffiliateDisclosure,
});
