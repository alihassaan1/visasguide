import { createFileRoute } from "@tanstack/react-router";
import VisaRequirements from "@/pages/VisaRequirements";

export const Route = createFileRoute("/visa-requirements/$slug")({
  component: VisaRequirements,
});
