import { createFileRoute } from "@tanstack/react-router";
import PolicyTracker from "@/pages/admin/PolicyTracker";

export const Route = createFileRoute("/admin/policy-tracker")({
  component: PolicyTracker,
});
