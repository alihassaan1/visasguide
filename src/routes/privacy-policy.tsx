import { createFileRoute } from "@tanstack/react-router";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () => publicHead({ title: "Privacy Policy | Visas.Guide", description: "How Visas.Guide handles personal information and protects your privacy.", path: "/privacy-policy" }),
  component: PrivacyPolicy,
});
