import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/marketing/social")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard", replace: true });
  },
});
