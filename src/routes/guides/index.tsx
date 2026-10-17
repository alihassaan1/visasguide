import { createFileRoute } from "@tanstack/react-router";
import VisaGuides from "@/pages/VisaGuides";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/guides/")({
  head: () => publicHead({ title: "Visa Application Guides & Travel Documentation Tips 2026 | Visas.Guide", description: "Step-by-step visa application guides for popular destinations. Expert tips on Schengen, US ESTA, UK visitor visas, and more.", path: "/guides" }),
  loader: async ({ context }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "guides" } })); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: VisaGuides,
});
