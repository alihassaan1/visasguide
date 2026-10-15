import { createFileRoute } from "@tanstack/react-router";
import MonetizationSettings from "@/pages/admin/MonetizationSettings";

export const Route = createFileRoute("/admin/monetization")({
  component: MonetizationSettings,
});
