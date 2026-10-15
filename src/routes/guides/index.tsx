import { createFileRoute } from "@tanstack/react-router";
import VisaGuides from "@/pages/VisaGuides";

export const Route = createFileRoute("/guides/")({
  component: VisaGuides,
});
