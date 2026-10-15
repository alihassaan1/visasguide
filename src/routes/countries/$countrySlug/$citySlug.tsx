import { createFileRoute } from "@tanstack/react-router";
import { RedirectCity } from "@/components/LegacyRedirects";

export const Route = createFileRoute("/countries/$countrySlug/$citySlug")({
  component: RedirectCity,
});
