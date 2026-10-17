import { createFileRoute } from "@tanstack/react-router";
import EtiasTimelinePage from "@/pages/etias/EtiasTimelinePage";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/etias/timeline")({
  head: () => publicHead({ title: "ETIAS Launch Timeline | 2018 to 2026 | Visas.Guide", description: "Follow the ETIAS launch timeline and official European Union updates.", path: "/etias/timeline" }),
  component: EtiasTimelinePage,
});
