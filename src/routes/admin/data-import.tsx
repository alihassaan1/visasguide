import { createFileRoute } from "@tanstack/react-router";
import DataImporter from "@/pages/admin/DataImporter";

export const Route = createFileRoute("/admin/data-import")({
  component: DataImporter,
});
