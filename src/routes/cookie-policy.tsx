import { createFileRoute } from "@tanstack/react-router";
import CookiePolicy from "@/pages/CookiePolicy";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/cookie-policy")({
  head: () => publicHead({ title: "Cookie Policy | Visas.Guide", description: "Learn how Visas.Guide uses cookies and similar tracking technologies.", path: "/cookie-policy" }),
  component: CookiePolicy,
});
