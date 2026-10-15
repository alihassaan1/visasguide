import { createFileRoute } from "@tanstack/react-router";
import TouristVisa from "@/pages/visa-types/TouristVisa";

export const Route = createFileRoute("/visa-types/tourist")({
  component: TouristVisa,
});
