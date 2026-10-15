import { createFileRoute } from "@tanstack/react-router";
import { RedirectVisaFree } from "@/components/LegacyRedirects";

export const Route = createFileRoute("/countries/$countrySlug/visa-free")({
  component: RedirectVisaFree,
});
