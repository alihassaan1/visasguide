import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BannerList } from '@/components/admin/ads/BannerList';
import MonetizationSettings from './MonetizationSettings';

export type AdsTab = 'banners' | 'network';

export default function AdsHub({ tab, onTabChange }: { tab: AdsTab; onTabChange: (tab: AdsTab) => void }) {
  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Ads & Monetization</h1>
        <p className="text-sm text-muted-foreground">All banners and affiliates with their clicks, plus ad network settings.</p>
      </div>
      <Tabs value={tab} onValueChange={v => onTabChange(v as AdsTab)}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="network">AdSense & consent</TabsTrigger>
        </TabsList>
        <TabsContent value="banners" className="mt-4"><BannerList /></TabsContent>
        <TabsContent value="network" className="mt-4"><MonetizationSettings networkOnly /></TabsContent>
      </Tabs>
    </div>
  );
}
