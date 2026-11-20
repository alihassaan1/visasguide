import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/marketing/posts")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard", replace: true });
  },
});
