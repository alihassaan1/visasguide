import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/")({
  head: () => publicHead({ title: "Visa Guide 2026 | Travel Visa Requirements & eVisa Info | Visas.Guide", description: "Travel visa requirements, work visas, visit visas, tourist visas and visa processing times for 200+ countries. Global Passport Index.", path: "/" }),
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "home" } })); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: Index,
});
