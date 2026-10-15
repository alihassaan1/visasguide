import { createFileRoute } from "@tanstack/react-router";
import EtiasNewsHub from "@/pages/etias/EtiasNewsHub";

export const Route = createFileRoute("/etias/news")({
  component: EtiasNewsHub,
});
