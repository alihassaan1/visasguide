import { createFileRoute } from "@tanstack/react-router";
import MonetizationSettings from "@/pages/admin/MonetizationSettings";
import { publicHead } from '@/lib/public-seo';

export const Route = createFileRoute("/admin/monetization")({
  component: () => <MonetizationSettings />,
  head: () => publicHead({ title: 'Ads and Affiliates | visas.guide Admin', description: 'Manage affiliate banner placements, advertising and consent settings.', path: '/admin/monetization', seoIndex: false }),
});
