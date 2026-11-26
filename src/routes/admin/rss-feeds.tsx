import { createFileRoute, redirect } from "@tanstack/react-router";

// This admin tool was removed along with its Supabase Edge Function; old links go to the dashboard.
export const Route = createFileRoute("/admin/rss-feeds")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard", replace: true });
  },
});
