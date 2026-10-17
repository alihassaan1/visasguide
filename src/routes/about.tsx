import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/about")({
  head: () => publicHead({ title: "About Visas.Guide | Trusted Visa Information", description: "Learn about Visas.Guide and our team helping travelers navigate visa requirements for 200+ countries worldwide.", path: "/about" }),
  component: About,
});
