import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/affiliate-manager")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/monetization", search: { tab: "banners" }, replace: true });
  },
});
