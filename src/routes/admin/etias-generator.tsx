import { createFileRoute } from "@tanstack/react-router";
import EtiasGenerator from "@/pages/admin/EtiasGenerator";

export const Route = createFileRoute("/admin/etias-generator")({
  component: EtiasGenerator,
});
