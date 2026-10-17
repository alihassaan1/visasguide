import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/feed")({
  beforeLoad: () => { throw redirect({ href: "https://awiytryceqehqapytfgn.supabase.co/functions/v1/rss-feed", statusCode: 302 }); },
});
