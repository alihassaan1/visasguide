import { createFileRoute } from "@tanstack/react-router";
import Unsubscribe from "@/pages/Unsubscribe";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/unsubscribe")({
  head: () => publicHead({ title: "Unsubscribe | Visas.Guide", description: "Manage your Visas.Guide newsletter subscription.", path: "/unsubscribe", unavailable: true }),
  component: Unsubscribe,
});
