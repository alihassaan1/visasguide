import { createFileRoute } from "@tanstack/react-router";
import ThingsToDo from "@/pages/ThingsToDo";

export const Route = createFileRoute("/things-to-do/$countrySlug")({
  component: ThingsToDo,
});
