import { createFileRoute } from "@tanstack/react-router";
import PolicyUpdates from "@/pages/PolicyUpdates";

export const Route = createFileRoute("/policy-updates")({
  component: PolicyUpdates,
});
