import { createFileRoute } from "@tanstack/react-router";
import CountryGuide from "@/pages/CountryGuide";

export const Route = createFileRoute("/countries/$countrySlug/")({
  component: CountryGuide,
});
