import { createFileRoute } from "@tanstack/react-router";
import PolicyUpdates from "@/pages/PolicyUpdates";

import { getPublicListingData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";
import { PublicRouteError } from "@/components/PublicRouteError";
import NotFound from "@/pages/NotFound";
import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/policy-updates")({
  head: () => publicHead({ title: "Visa Policy Updates 2026 | Latest Changes Worldwide | visas.guide", description: "Live tracker of visa policy changes, fee updates, eVisa launches and entry rule changes from around the world.", path: "/policy-updates" }),
  validateSearch: (search: Record<string, unknown>) => ({ ...(typeof search.country === "string" ? { country: search.country } : {}), ...(typeof search.type === "string" ? { type: search.type } : {}), ...(typeof search.severity === "string" ? { severity: search.severity } : {}) }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => { seedQueries(context.queryClient, await getPublicListingData({ data: { kind: "policy", country: deps.country ?? "all", changeType: deps.type ?? "all", severity: deps.severity ?? "all" } })); },
  errorComponent: PublicRouteError,
  notFoundComponent: NotFound,
  component: PolicyUpdates,
});
