import { createFileRoute } from "@tanstack/react-router";
import NewsletterManager from "@/pages/admin/NewsletterManager";

export const Route = createFileRoute("/admin/newsletter")({
  component: NewsletterManager,
});
