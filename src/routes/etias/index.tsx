import { createFileRoute } from "@tanstack/react-router";
import EtiasHub from "@/pages/etias/EtiasHub";

export const Route = createFileRoute("/etias/")({
  component: EtiasHub,
});
