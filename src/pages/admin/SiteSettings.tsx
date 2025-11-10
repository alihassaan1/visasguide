import { SiteSettingsManager } from "@/components/admin/SiteSettingsManager";

export default function SiteSettings() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
        <p className="text-muted-foreground">Configure footer links and social media connections</p>
      </div>

      <SiteSettingsManager />
    </div>
  );
}
