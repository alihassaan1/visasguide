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
import { Plus, Trash2, ExternalLink, Target, Calendar, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { CountryMultiSelect } from "@/components/admin/CountryMultiSelect";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AffiliateData {
  id: string;
  name: string;
  target_url: string;
  html_embed: string | null;
  image_url: string | null;
  is_active: boolean;
  click_count: number;
  position: string;
  target_countries: string[];
  exclude_countries: string[];
  target_page_patterns: string[];
  priority: number;
  start_date: string | null;
  end_date: string | null;
  impressions: number;
}

export default function MonetizationSettings() {
  const { toast } = useToast();
  const [adsenseCode, setAdsenseCode] = useState("");
  const [gdprConsentCode, setGdprConsentCode] = useState("");
  const [affiliates, setAffiliates] = useState<AffiliateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTargeting, setExpandedTargeting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: adsense } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'adsense_code')
        .single();

      if (adsense && typeof adsense.setting_value === 'object') {
        setAdsenseCode((adsense.setting_value as any)?.code || '');
      }

      const { data: gdpr } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'gdpr_consent_code')
        .single();

      if (gdpr && typeof gdpr.setting_value === 'object') {
        setGdprConsentCode((gdpr.setting_value as any)?.code || '');
      }

      const { data: affiliateData } = await supabase
        .from('settings_affiliates')
        .select('*')
        .order('priority', { ascending: false });

      setAffiliates((affiliateData || []).map(aff => ({
        ...aff,
        target_countries: aff.target_countries || [],
        exclude_countries: aff.exclude_countries || [],
        target_page_patterns: aff.target_page_patterns || [],
        priority: aff.priority || 0,
        impressions: aff.impressions || 0,
      })));
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  const saveAdsense = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { setting_key: 'adsense_code', setting_value: { code: adsenseCode } },
          { onConflict: 'setting_key' }
        );

      if (error) throw error;
      toast({ title: "AdSense code saved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveGdprConsent = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { setting_key: 'gdpr_consent_code', setting_value: { code: gdprConsentCode } },
          { onConflict: 'setting_key' }
        );

      if (error) throw error;
      toast({ title: "GDPR Consent code saved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addAffiliate = async () => {
    try {
      const { error } = await supabase.from('settings_affiliates').insert({
        name: 'New Affiliate Banner',
        target_url: 'https://example.com',
        position: 'sidebar-right',
        is_active: false,
        html_embed: '',
        target_countries: [],
        exclude_countries: [],
        target_page_patterns: [],
        priority: 0,
      });

      if (error) throw error;
      await loadSettings();
      toast({ title: "Affiliate banner added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateAffiliate = async (id: string, updates: Partial<AffiliateData>) => {
    try {
      const { error } = await supabase
        .from('settings_affiliates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAffiliates(prev => 
        prev.map(aff => aff.id === id ? { ...aff, ...updates } : aff)
      );

      toast({ title: "Affiliate banner updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteAffiliate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('settings_affiliates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAffiliates(prev => prev.filter(aff => aff.id !== id));
      toast({ title: "Affiliate banner deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return "0.00%";
    return ((clicks / impressions) * 100).toFixed(2) + "%";
  };

  const toggleTargeting = (id: string) => {
    setExpandedTargeting(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Monetization Settings</h1>
        <p className="text-muted-foreground">Manage AdSense, affiliate banners, and geo-targeting</p>
      </div>

      <Tabs defaultValue="affiliates">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="gdpr">GDPR Consent</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliate Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="gdpr">
          <Card>
            <CardHeader>
              <CardTitle>Google GDPR Consent Banner</CardTitle>
              <CardDescription>Configure the cookie consent banner for EEA/UK visitors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Google CMP Code</Label>
                <Textarea
                  value={gdprConsentCode}
                  onChange={(e) => setGdprConsentCode(e.target.value)}
                  placeholder="Paste the Google Consent Management Platform code..."
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>
              <Button onClick={saveGdprConsent} disabled={loading}>Save GDPR Consent Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

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
              </div>
              <Button onClick={saveAdsense} disabled={loading}>Save AdSense Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Affiliate Banners</h2>
                <p className="text-muted-foreground">Geo-targeted banners with analytics</p>
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
                        <div className="flex flex-wrap gap-2">
                          {affiliate.target_countries.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Target className="mr-1 h-3 w-3" />
                              {affiliate.target_countries.length} countries
                            </Badge>
                          )}
                          {affiliate.target_page_patterns.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {affiliate.target_page_patterns.length} page patterns
                            </Badge>
                          )}
                          {(affiliate.start_date || affiliate.end_date) && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="mr-1 h-3 w-3" />
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={affiliate.is_active}
                          onCheckedChange={(checked) => updateAffiliate(affiliate.id, { is_active: checked })}
                        />
                        <Button variant="ghost" size="icon" onClick={() => deleteAffiliate(affiliate.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <SelectContent className="bg-card border z-50">
                            <SelectItem value="sidebar-left">Sidebar Left</SelectItem>
                            <SelectItem value="sidebar-right">Sidebar Right</SelectItem>
                            <SelectItem value="horizontal-banner">Horizontal Banner</SelectItem>
                            <SelectItem value="in-content">In-Content</SelectItem>
                            <SelectItem value="footer">Footer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Input
                          type="number"
                          value={affiliate.priority}
                          onChange={(e) => updateAffiliate(affiliate.id, { priority: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Higher = shown first</p>
                      </div>
                    </div>

                    {/* Targeting Section */}
                    <Collapsible open={expandedTargeting[affiliate.id]} onOpenChange={() => toggleTargeting(affiliate.id)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center">
                            <Target className="mr-2 h-4 w-4" />
                            Targeting Options
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {expandedTargeting[affiliate.id] ? 'Hide' : 'Show'}
                          </span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Show to Countries (empty = all)</Label>
                            <CountryMultiSelect
                              value={affiliate.target_countries}
                              onChange={(value) => updateAffiliate(affiliate.id, { target_countries: value })}
                              placeholder="Select target countries..."
                            />
                          </div>
                          <div>
                            <Label>Exclude Countries</Label>
                            <CountryMultiSelect
                              value={affiliate.exclude_countries}
                              onChange={(value) => updateAffiliate(affiliate.id, { exclude_countries: value })}
                              placeholder="Select countries to exclude..."
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Page URL Patterns (empty = all pages)</Label>
                          <Textarea
                            value={affiliate.target_page_patterns.join('\n')}
                            onChange={(e) => updateAffiliate(affiliate.id, { 
                              target_page_patterns: e.target.value.split('\n').filter(p => p.trim()) 
                            })}
                            placeholder="*-to-thailand*&#10;/visa-guides/*&#10;/united-arab-emirates-*"
                            rows={3}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            One pattern per line. Use * as wildcard. Example: *-to-indonesia* matches all pages with "-to-indonesia" in the URL
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date (optional)</Label>
                            <Input
                              type="datetime-local"
                              value={affiliate.start_date ? affiliate.start_date.slice(0, 16) : ''}
                              onChange={(e) => updateAffiliate(affiliate.id, { 
                                start_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                              })}
                            />
                          </div>
                          <div>
                            <Label>End Date (optional)</Label>
                            <Input
                              type="datetime-local"
                              value={affiliate.end_date ? affiliate.end_date.slice(0, 16) : ''}
                              onChange={(e) => updateAffiliate(affiliate.id, { 
                                end_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                              })}
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <div>
                      <Label>HTML Embed Code (Optional)</Label>
                      <Textarea
                        value={affiliate.html_embed || ''}
                        onChange={(e) => updateAffiliate(affiliate.id, { html_embed: e.target.value })}
                        placeholder="Paste HTML embed code..."
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>

                    {!affiliate.html_embed && (
                      <div>
                        <Label>Banner Image</Label>
                        <ImageUpload
                          value={affiliate.image_url || ''}
                          onChange={(url) => updateAffiliate(affiliate.id, { image_url: url })}
                        />
                      </div>
                    )}

                    {/* Analytics Section */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Impressions</p>
                        <p className="text-xl font-bold">{affiliate.impressions.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Clicks</p>
                        <p className="text-xl font-bold">{affiliate.click_count.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">CTR</p>
                        <p className="text-xl font-bold">{calculateCTR(affiliate.click_count, affiliate.impressions)}</p>
                      </div>
                    </div>

                    {affiliate.target_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={affiliate.target_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Preview Link
                        </a>
                      </Button>
                    )}
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
