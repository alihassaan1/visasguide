import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save, BarChart3, Share2, Eye } from 'lucide-react';
import { useSiteSettings, QUERY_KEYS } from '@/hooks/useSharedData';
import { useQueryClient } from '@tanstack/react-query';

interface FooterLink {
  label: string;
  url: string;
}

interface FooterLinks {
  popular_destinations: FooterLink[];
  visa_types: FooterLink[];
  resources: FooterLink[];
}

interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
}

interface AnalyticsSettings {
  google_analytics_id: string;
  google_tag_manager_id: string;
  google_adsense_publisher_id: string;
  facebook_pixel_id: string;
  tiktok_pixel_id: string;
  linkedin_insight_tag: string;
  twitter_pixel_id: string;
  pinterest_tag_id: string;
  microsoft_clarity_id: string;
}

export const SiteSettingsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: sharedSettings } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [footerLinks, setFooterLinks] = useState<FooterLinks>({
    popular_destinations: [],
    visa_types: [],
    resources: []
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: ''
  });
  const [analyticsSettings, setAnalyticsSettings] = useState<AnalyticsSettings>({
    google_analytics_id: '',
    google_tag_manager_id: '',
    google_adsense_publisher_id: '',
    facebook_pixel_id: '',
    tiktok_pixel_id: '',
    linkedin_insight_tag: '',
    twitter_pixel_id: '',
    pinterest_tag_id: '',
    microsoft_clarity_id: ''
  });

  useEffect(() => {
      if (!sharedSettings) return;
      if (sharedSettings.footer_links) {
        setFooterLinks(sharedSettings.footer_links as FooterLinks);
      }
      if (sharedSettings.social_links) {
        setSocialLinks(sharedSettings.social_links as SocialLinks);
      }
      if (sharedSettings.analytics_settings) {
        setAnalyticsSettings({
          google_analytics_id: '',
          google_tag_manager_id: '',
          google_adsense_publisher_id: '',
          facebook_pixel_id: '',
          tiktok_pixel_id: '',
          linkedin_insight_tag: '',
          twitter_pixel_id: '',
          pinterest_tag_id: '',
          microsoft_clarity_id: '',
          ...sharedSettings.analytics_settings
        });
      }
  }, [sharedSettings]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error: footerError } = await supabase
        .from('site_settings')
        .update({ setting_value: footerLinks as any })
        .eq('setting_key', 'footer_links');

      const { error: socialError } = await supabase
        .from('site_settings')
        .update({ setting_value: socialLinks as any })
        .eq('setting_key', 'social_links');

      // Upsert analytics settings
      const { error: analyticsError } = await supabase
        .from('site_settings')
        .upsert({ 
          setting_key: 'analytics_settings',
          setting_value: analyticsSettings as any 
        }, { onConflict: 'setting_key' });

      if (footerError || socialError || analyticsError) throw footerError || socialError || analyticsError;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.siteSettings });

      toast({
        title: "Settings saved",
        description: "All settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFooterLink = (section: keyof FooterLinks) => {
    setFooterLinks({
      ...footerLinks,
      [section]: [...footerLinks[section], { label: '', url: '' }]
    });
  };

  const updateFooterLink = (section: keyof FooterLinks, index: number, field: 'label' | 'url', value: string) => {
    const updated = [...footerLinks[section]];
    updated[index] = { ...updated[index], [field]: value };
    setFooterLinks({ ...footerLinks, [section]: updated });
  };

  const removeFooterLink = (section: keyof FooterLinks, index: number) => {
    const updated = footerLinks[section].filter((_, i) => i !== index);
    setFooterLinks({ ...footerLinks, [section]: updated });
  };

  return (
    <div className="space-y-6">
      {/* Analytics & Tracking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Tracking
          </CardTitle>
          <CardDescription>
            Add your tracking pixels and analytics IDs to monitor website traffic and conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Analytics */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Google Analytics</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ga_id">Google Analytics Measurement ID</Label>
                <Input
                  id="ga_id"
                  value={analyticsSettings.google_analytics_id}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, google_analytics_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Find this in Google Analytics → Admin → Data Streams → Your stream
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gtm_id">Google Tag Manager ID (Optional)</Label>
                <Input
                  id="gtm_id"
                  value={analyticsSettings.google_tag_manager_id}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, google_tag_manager_id: e.target.value })}
                  placeholder="GTM-XXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Use this if you prefer managing tags through GTM
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Google AdSense */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Google AdSense (Monetization)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adsense_id">Google AdSense Publisher ID</Label>
                <Input
                  id="adsense_id"
                  value={analyticsSettings.google_adsense_publisher_id}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, google_adsense_publisher_id: e.target.value })}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Find this in Google AdSense → Account → Account Information → Publisher ID
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Social Media Pixels */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social Media Pixels
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fb_pixel_id">Facebook Pixel ID</Label>
                <Input
                  id="fb_pixel_id"
                  value={analyticsSettings.facebook_pixel_id}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, facebook_pixel_id: e.target.value })}
                  placeholder="XXXXXXXXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Meta Events Manager → Data Sources → Your Pixel
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok_pixel_id">TikTok Pixel ID</Label>
                <Input
                  id="tiktok_pixel_id"
                  value={analyticsSettings.tiktok_pixel_id}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, tiktok_pixel_id: e.target.value })}
                  placeholder="XXXXXXXXXXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  TikTok Ads Manager → Assets → Events → Web Events
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter_pixel_id">Twitter/X Pixel ID</Label>
                <Input
                  id="twitter_pixel_id"
                  value={analyticsSettings.twitter_pixel_id}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, twitter_pixel_id: e.target.value })}
                  placeholder="XXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  X Ads Manager → Tools → Conversion tracking
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_insight_tag">LinkedIn Insight Tag</Label>
                <Input
                  id="linkedin_insight_tag"
                  value={analyticsSettings.linkedin_insight_tag}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, linkedin_insight_tag: e.target.value })}
                  placeholder="XXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  LinkedIn Campaign Manager → Account Assets → Insight Tag
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinterest_tag_id">Pinterest Tag ID</Label>
                <Input
                  id="pinterest_tag_id"
                  value={analyticsSettings.pinterest_tag_id}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, pinterest_tag_id: e.target.value })}
                  placeholder="XXXXXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Pinterest Ads → Conversions → Pinterest Tag
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Behavior Analytics */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Behavior Analytics & Heatmaps
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="microsoft_clarity_id">Microsoft Clarity Project ID</Label>
                <Input
                  id="microsoft_clarity_id"
                  value={analyticsSettings.microsoft_clarity_id}
                  onChange={(e) => setAnalyticsSettings({ ...analyticsSettings, microsoft_clarity_id: e.target.value })}
                  placeholder="xxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  Free heatmaps & session recordings. Get ID from clarity.microsoft.com
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>
            Add your social media profile URLs. Leave empty to hide the icon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Links */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Links</CardTitle>
          <CardDescription>
            Manage the links displayed in your footer sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Popular Destinations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Popular Destinations</Label>
              <Button size="sm" onClick={() => addFooterLink('popular_destinations')}>
                <Plus className="h-4 w-4 mr-1" /> Add Link
              </Button>
            </div>
            {footerLinks.popular_destinations.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Label (e.g., United States)"
                  value={link.label}
                  onChange={(e) => updateFooterLink('popular_destinations', index, 'label', e.target.value)}
                />
                <Input
                  placeholder="URL (e.g., /countries/united-states)"
                  value={link.url}
                  onChange={(e) => updateFooterLink('popular_destinations', index, 'url', e.target.value)}
                />
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => removeFooterLink('popular_destinations', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Visa Types */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Visa Types</Label>
              <Button size="sm" onClick={() => addFooterLink('visa_types')}>
                <Plus className="h-4 w-4 mr-1" /> Add Link
              </Button>
            </div>
            {footerLinks.visa_types.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Label (e.g., Tourist Visa)"
                  value={link.label}
                  onChange={(e) => updateFooterLink('visa_types', index, 'label', e.target.value)}
                />
                <Input
                  placeholder="URL (e.g., /visa-types/tourist)"
                  value={link.url}
                  onChange={(e) => updateFooterLink('visa_types', index, 'url', e.target.value)}
                />
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => removeFooterLink('visa_types', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Resources */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Resources</Label>
              <Button size="sm" onClick={() => addFooterLink('resources')}>
                <Plus className="h-4 w-4 mr-1" /> Add Link
              </Button>
            </div>
            {footerLinks.resources.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Label (e.g., Application Guides)"
                  value={link.label}
                  onChange={(e) => updateFooterLink('resources', index, 'label', e.target.value)}
                />
                <Input
                  placeholder="URL (e.g., /guides)"
                  value={link.url}
                  onChange={(e) => updateFooterLink('resources', index, 'url', e.target.value)}
                />
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => removeFooterLink('resources', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
};
