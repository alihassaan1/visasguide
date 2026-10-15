import { createFileRoute } from "@tanstack/react-router";
import VisaRequirementsContentUpdater from "@/pages/admin/VisaRequirementsContentUpdater";

export const Route = createFileRoute("/admin/visa-requirements-content-updater")({
  component: VisaRequirementsContentUpdater,
});
