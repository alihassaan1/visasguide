import { createFileRoute } from "@tanstack/react-router";
import ThingsToDoIndex from "@/pages/ThingsToDoIndex";

export const Route = createFileRoute("/things-to-do/")({
  component: ThingsToDoIndex,
});
