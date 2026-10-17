import { createFileRoute } from "@tanstack/react-router";
import Contact from "@/pages/Contact";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/contact")({
  head: () => publicHead({ title: "Contact Us | Get Visa Help & Support | Visas.Guide", description: "Contact our team for visa information, support, and travel documentation guidance.", path: "/contact" }),
  component: Contact,
});
