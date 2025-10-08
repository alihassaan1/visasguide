import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save } from 'lucide-react';

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

export const SiteSettingsManager = () => {
  const { toast } = useToast();
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: footerData } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'footer_links')
        .single();

      const { data: socialData } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'social_links')
        .single();

      if (footerData?.setting_value) {
        setFooterLinks(footerData.setting_value as any as FooterLinks);
      }
      if (socialData?.setting_value) {
        setSocialLinks(socialData.setting_value as any as SocialLinks);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

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

      if (footerError || socialError) throw footerError || socialError;

      toast({
        title: "Settings saved",
        description: "Footer and social links have been updated successfully.",
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
