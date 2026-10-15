import { createFileRoute } from "@tanstack/react-router";
import VisaSearch from "@/pages/VisaSearch";

export const Route = createFileRoute("/visa-search")({
  component: VisaSearch,
});
