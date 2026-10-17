import { createFileRoute } from "@tanstack/react-router";
import ThingsToDoIndex from "@/pages/ThingsToDoIndex";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/things-to-do/")({
  head: () => publicHead({ title: "Things to Do Around the World | Destination Guides 2026 | Visas.Guide", description: "Browse attractions, activities and tours in popular destinations around the world.", path: "/things-to-do" }),
  component: ThingsToDoIndex,
});
