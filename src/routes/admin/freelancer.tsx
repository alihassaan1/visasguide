import { createFileRoute } from "@tanstack/react-router";
import FreelancerDashboard from "@/pages/admin/FreelancerDashboard";

export const Route = createFileRoute("/admin/freelancer")({
  component: FreelancerDashboard,
});
