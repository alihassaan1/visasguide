import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BannerList } from '@/components/admin/ads/BannerList';
import AdPerformanceDashboard from './AdPerformanceDashboard';
import AffiliateManager from './AffiliateManager';
import MonetizationSettings from './MonetizationSettings';

export type AdsTab = 'banners' | 'performance' | 'widgets' | 'network';

export default function AdsHub({ tab, onTabChange }: { tab: AdsTab; onTabChange: (tab: AdsTab) => void }) {
  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Ads & Monetization</h1>
        <p className="text-sm text-muted-foreground">Banners, brands, performance and ad network settings in one place.</p>
      </div>
      <Tabs value={tab} onValueChange={v => onTabChange(v as AdsTab)}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="widgets">GetYourGuide widgets</TabsTrigger>
          <TabsTrigger value="network">AdSense & consent</TabsTrigger>
        </TabsList>
        <TabsContent value="banners" className="mt-4"><BannerList /></TabsContent>
        <TabsContent value="performance" className="mt-4"><AdPerformanceDashboard /></TabsContent>
        <TabsContent value="widgets" className="mt-4"><AffiliateManager gygWidgetsOnly /></TabsContent>
        <TabsContent value="network" className="mt-4"><MonetizationSettings networkOnly /></TabsContent>
      </Tabs>
    </div>
  );
}
