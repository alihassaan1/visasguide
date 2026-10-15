import { createFileRoute } from "@tanstack/react-router";
import EtiasCountryPage from "@/pages/etias/EtiasCountryPage";

export const Route = createFileRoute("/etias/for/$countrySlug")({
  component: EtiasCountryPage,
});
