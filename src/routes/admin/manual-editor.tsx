import { createFileRoute } from "@tanstack/react-router";
import ManualContentEditor from "@/pages/admin/ManualContentEditor";

export const Route = createFileRoute("/admin/manual-editor")({
  component: ManualContentEditor,
});
