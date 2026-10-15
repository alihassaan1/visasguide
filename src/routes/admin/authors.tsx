import { createFileRoute } from "@tanstack/react-router";
import AuthorManager from "@/pages/admin/AuthorManager";

export const Route = createFileRoute("/admin/authors")({
  component: AuthorManager,
});
