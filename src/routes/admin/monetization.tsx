import { createFileRoute } from "@tanstack/react-router";
import AdsHub, { type AdsTab } from "@/pages/admin/AdsHub";
import { publicHead } from '@/lib/public-seo';

const TABS: AdsTab[] = ['banners', 'network'];

export const Route = createFileRoute("/admin/monetization")({
  validateSearch: (search: Record<string, unknown>): { tab?: AdsTab } => ({
    tab: TABS.includes(search.tab as AdsTab) ? (search.tab as AdsTab) : undefined,
  }),
  component: MonetizationPage,
  head: () => publicHead({ title: 'Ads & Monetization | visas.guide Admin', description: 'Manage banners, affiliate brands, ad performance and network settings.', path: '/admin/monetization', seoIndex: false }),
});

function MonetizationPage() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  return <AdsHub tab={tab ?? 'banners'} onTabChange={(next) => navigate({ search: { tab: next }, replace: true })} />;
}
