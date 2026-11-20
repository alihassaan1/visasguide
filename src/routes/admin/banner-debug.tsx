import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/banner-debug")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/monetization", search: { tab: "banners" }, replace: true });
  },
});
