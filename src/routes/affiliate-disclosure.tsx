import { createFileRoute } from "@tanstack/react-router";
import AffiliateDisclosure from "@/pages/AffiliateDisclosure";

export const Route = createFileRoute("/affiliate-disclosure")({
  component: AffiliateDisclosure,
});
