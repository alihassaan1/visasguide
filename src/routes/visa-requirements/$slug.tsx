import { createFileRoute } from "@tanstack/react-router";
import VisaRequirements from "@/pages/VisaRequirements";
import { getVisaRequirementData } from "@/lib/page-data.functions";
import { seedQueries } from "@/lib/seedQueries";

export const Route = createFileRoute("/visa-requirements/$slug")({
  loader: async ({ params, context }) => {
    seedQueries(context.queryClient, await getVisaRequirementData({ data: { slug: params.slug } }));
  },
  component: VisaRequirements,
});
