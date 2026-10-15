import { createFileRoute } from "@tanstack/react-router";
import SchengenVisaGuide from "@/pages/SchengenVisaGuide";

export const Route = createFileRoute("/schengen-visa-guide")({
  component: SchengenVisaGuide,
});
