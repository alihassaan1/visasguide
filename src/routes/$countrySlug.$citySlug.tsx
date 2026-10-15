import { createFileRoute } from "@tanstack/react-router";
import CityPage from "@/pages/CityPage";

export const Route = createFileRoute("/$countrySlug/$citySlug")({
  component: CityPage,
});
