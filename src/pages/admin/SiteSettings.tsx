import { SiteSettingsManager } from "@/components/admin/SiteSettingsManager";
import { PixelStatusDashboard } from "@/components/admin/PixelStatusDashboard";

export default function SiteSettings() {
  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-6xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Site Settings</h1>
        <p className="text-muted-foreground">Configure tracking pixels, social media, and footer links</p>
      </div>

      <div className="space-y-6">
        {/* Pixel Status Dashboard */}
        <PixelStatusDashboard />
        
        {/* Settings Manager */}
        <SiteSettingsManager />
      </div>
    </div>
  );
}
