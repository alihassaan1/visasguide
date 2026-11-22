import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/ad-performance")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/monetization", replace: true });
  },
});
