import { createFileRoute } from "@tanstack/react-router";
import VisaRequirementsManager from "@/pages/admin/VisaRequirementsManager";

export const Route = createFileRoute("/admin/visa-requirements")({
  component: VisaRequirementsManager,
});
