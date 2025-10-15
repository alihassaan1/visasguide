import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function MonetizationSettings() {
  const { toast } = useToast();
  const [adsenseCode, setAdsenseCode] = useState("");
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load AdSense settings
      const { data: adsense } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'adsense_code')
        .single();

      // @ts-ignore - Json type contains code property
      if (adsense) setAdsenseCode(adsense.setting_value?.code || '');

      // Load affiliate banners
      const { data: affiliateData } = await supabase
        // @ts-ignore - settings_affiliates table exists but types not regenerated yet
        .from('settings_affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      setAffiliates(affiliateData || []);
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  const saveAdsense = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'adsense_code',
          setting_value: { code: adsenseCode }
        });

      if (error) throw error;

      toast({ title: "AdSense code saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAffiliate = async () => {
    try {
      // @ts-ignore - settings_affiliates table exists but types not regenerated yet
      const { error } = await (supabase.from('settings_affiliates') as any).insert({
        name: 'New Affiliate Banner',
        target_url: 'https://example.com',
        position: 'sidebar',
        is_active: false
      });

      if (error) throw error;

      await loadSettings();
      toast({ title: "Affiliate banner added" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAffiliate = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        // @ts-ignore - settings_affiliates table exists but types not regenerated yet
        .from('settings_affiliates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAffiliates(prev => 
        prev.map(aff => aff.id === id ? { ...aff, ...updates } : aff)
      );

      toast({ title: "Affiliate banner updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAffiliate = async (id: string) => {
    try {
      const { error } = await supabase
        // @ts-ignore - settings_affiliates table exists but types not regenerated yet
        .from('settings_affiliates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAffiliates(prev => prev.filter(aff => aff.id !== id));
      toast({ title: "Affiliate banner deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Monetization Settings</h1>
        <p className="text-muted-foreground">Manage AdSense and affiliate banners</p>
      </div>

      <Tabs defaultValue="adsense">
        <TabsList>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="adsense">
          <Card>
            <CardHeader>
              <CardTitle>Google AdSense Settings</CardTitle>
              <CardDescription>Configure AdSense codes for your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>AdSense Code</Label>
                <Textarea
                  value={adsenseCode}
                  onChange={(e) => setAdsenseCode(e.target.value)}
                  placeholder="Paste your AdSense code here..."
                  rows={6}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  This code will be inserted into the header and in-content ad positions
                </p>
              </div>

              <Button onClick={saveAdsense} disabled={loading}>
                Save AdSense Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Affiliate Banners</h2>
                <p className="text-muted-foreground">Manage affiliate link banners and track clicks</p>
              </div>
              <Button onClick={addAffiliate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {affiliates.map((affiliate) => (
                <Card key={affiliate.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Input
                          value={affiliate.name}
                          onChange={(e) => updateAffiliate(affiliate.id, { name: e.target.value })}
                          className="font-semibold text-lg mb-2"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={affiliate.is_active}
                          onCheckedChange={(checked) => updateAffiliate(affiliate.id, { is_active: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAffiliate(affiliate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Target URL</Label>
                        <Input
                          value={affiliate.target_url}
                          onChange={(e) => updateAffiliate(affiliate.id, { target_url: e.target.value })}
                          placeholder="https://affiliate-link.com"
                        />
                      </div>

                      <div>
                        <Label>Position</Label>
                        <Select
                          value={affiliate.position}
                          onValueChange={(value) => updateAffiliate(affiliate.id, { position: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sidebar">Sidebar</SelectItem>
                            <SelectItem value="header">Header</SelectItem>
                            <SelectItem value="in-content">In-Content</SelectItem>
                            <SelectItem value="footer">Footer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Banner Image</Label>
                      <ImageUpload
                        value={affiliate.image_url || ''}
                        onChange={(url) => updateAffiliate(affiliate.id, { image_url: url })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Total Clicks</p>
                        <p className="text-2xl font-bold">{affiliate.click_count || 0}</p>
                      </div>
                      {affiliate.target_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={affiliate.target_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Preview Link
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {affiliates.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No affiliate banners configured yet</p>
                    <Button onClick={addAffiliate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Banner
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}