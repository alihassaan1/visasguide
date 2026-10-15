import { createFileRoute } from "@tanstack/react-router";
import SocialPostsList from "@/pages/admin/SocialPostsList";

export const Route = createFileRoute("/admin/marketing/posts")({
  component: SocialPostsList,
});
