import { createFileRoute } from "@tanstack/react-router";
import AffiliateManager from "@/pages/admin/AffiliateManager";
import { publicHead } from '@/lib/public-seo';

export const Route = createFileRoute("/admin/affiliate-manager")({
  component: AffiliateManager,
  head: () => publicHead({ title: 'Affiliate Manager | visas.guide Admin', description: 'Manage affiliate programs, banner creatives and GetYourGuide widgets.', path: '/admin/affiliate-manager', seoIndex: false }),
});
