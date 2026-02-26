import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink, Settings2, Eye, MousePointerClick, Percent, Save } from "lucide-react";
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
  const [localAffiliates, setLocalAffiliates] = useState<AffiliateData[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [expandedAdvanced, setExpandedAdvanced] = useState<Record<string, boolean>>({});
  const [editingName, setEditingName] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  // Sync local state when affiliates load from DB
  useEffect(() => {
    setLocalAffiliates(affiliates);
    setDirtyIds(new Set());
  }, [affiliates]);

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

  // Update local state only (no DB write)
  const updateLocal = (id: string, updates: Partial<AffiliateData>) => {
    setLocalAffiliates(prev =>
      prev.map(aff => aff.id === id ? { ...aff, ...updates } : aff)
    );
    setDirtyIds(prev => new Set(prev).add(id));
  };

  // Instant save for toggles (is_active) — these should apply immediately
  const updateInstant = async (id: string, updates: Partial<AffiliateData>) => {
    try {
      const { error } = await supabase
        .from('settings_affiliates')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      setLocalAffiliates(prev =>
        prev.map(aff => aff.id === id ? { ...aff, ...updates } : aff)
      );
      setAffiliates(prev =>
        prev.map(aff => aff.id === id ? { ...aff, ...updates } : aff)
      );
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Save a single affiliate to DB
  const saveAffiliate = async (id: string) => {
    const aff = localAffiliates.find(a => a.id === id);
    if (!aff) return;

    setSavingIds(prev => new Set(prev).add(id));
    try {
      const { error } = await supabase
        .from('settings_affiliates')
        .update({
          name: aff.name,
          target_url: aff.target_url,
          html_embed: aff.html_embed,
          image_url: aff.image_url,
          position: aff.position,
          priority: aff.priority,
          target_countries: aff.target_countries,
          exclude_countries: aff.exclude_countries,
          target_page_patterns: aff.target_page_patterns,
          start_date: aff.start_date,
          end_date: aff.end_date,
        })
        .eq('id', id);
      if (error) throw error;

      setAffiliates(prev =>
        prev.map(a => a.id === id ? { ...aff } : a)
      );
      setDirtyIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast({ title: "Banner saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
      setLocalAffiliates(prev => prev.filter(aff => aff.id !== id));
      toast({ title: "Affiliate banner deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return "0.00%";
    return ((clicks / impressions) * 100).toFixed(2) + "%";
  };

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Monetization</h1>
        <p className="text-sm text-muted-foreground">Manage ads, banners & affiliate links</p>
      </div>

      <Tabs defaultValue="affiliates">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="affiliates">Affiliate Banners</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR Consent</TabsTrigger>
        </TabsList>

        <TabsContent value="gdpr">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold">Google GDPR Consent Banner</h2>
              <p className="text-sm text-muted-foreground">Cookie consent for EEA/UK visitors</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={gdprConsentCode}
                onChange={(e) => setGdprConsentCode(e.target.value)}
                placeholder="Paste the Google CMP code..."
                rows={8}
                className="font-mono text-xs"
              />
              <Button onClick={saveGdprConsent} disabled={loading}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adsense">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold">Google AdSense</h2>
              <p className="text-sm text-muted-foreground">Configure AdSense code</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={adsenseCode}
                onChange={(e) => setAdsenseCode(e.target.value)}
                placeholder="Paste your AdSense code here..."
                rows={6}
              />
              <Button onClick={saveAdsense} disabled={loading}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{localAffiliates.length} banner{localAffiliates.length !== 1 ? 's' : ''}</p>
              <Button onClick={addAffiliate} size="sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Banner
              </Button>
            </div>

            {localAffiliates.map((affiliate) => {
              const isDirty = dirtyIds.has(affiliate.id);
              const isSaving = savingIds.has(affiliate.id);

              return (
                <Card key={affiliate.id} className={`overflow-hidden ${isDirty ? 'ring-1 ring-primary/40' : ''}`}>
                  {/* Header row */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
                    <div className="flex-1 min-w-0">
                      {editingName === affiliate.id ? (
                        <Input
                          value={affiliate.name}
                          onChange={(e) => updateLocal(affiliate.id, { name: e.target.value })}
                          onBlur={() => setEditingName(null)}
                          onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(null); }}
                          className="h-7 text-sm font-semibold"
                          autoFocus
                        />
                      ) : (
                        <button
                          className="text-sm font-semibold truncate hover:text-primary transition-colors text-left"
                          onClick={() => setEditingName(affiliate.id)}
                          title="Click to edit name"
                        >
                          {affiliate.name}
                        </button>
                      )}
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs gap-1 font-normal">
                        <Eye className="h-3 w-3" />{affiliate.impressions.toLocaleString()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs gap-1 font-normal">
                        <MousePointerClick className="h-3 w-3" />{affiliate.click_count.toLocaleString()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs gap-1 font-normal">
                        <Percent className="h-3 w-3" />{calculateCTR(affiliate.click_count, affiliate.impressions)}
                      </Badge>
                    </div>

                    <Switch
                      checked={affiliate.is_active}
                      onCheckedChange={(checked) => {
                        updateLocal(affiliate.id, { is_active: checked });
                        updateInstant(affiliate.id, { is_active: checked });
                      }}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteAffiliate(affiliate.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Target URL</Label>
                          <Input
                            value={affiliate.target_url}
                            onChange={(e) => updateLocal(affiliate.id, { target_url: e.target.value })}
                            placeholder="https://affiliate-link.com"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Position</Label>
                            <Select
                              value={affiliate.position}
                              onValueChange={(value) => updateLocal(affiliate.id, { position: value })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border z-50">
                                <SelectItem value="sidebar-left">Sidebar Left</SelectItem>
                                <SelectItem value="sidebar-right">Sidebar Right</SelectItem>
                                <SelectItem value="horizontal-banner">Horizontal</SelectItem>
                                <SelectItem value="in-content">In-Content</SelectItem>
                                <SelectItem value="footer">Footer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Priority</Label>
                            <Input
                              type="number"
                              value={affiliate.priority}
                              onChange={(e) => updateLocal(affiliate.id, { priority: parseInt(e.target.value) || 0 })}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        {affiliate.target_url && affiliate.target_url !== 'https://example.com' && (
                          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                            <a href={affiliate.target_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1.5 h-3 w-3" />
                              Preview Link
                            </a>
                          </Button>
                        )}
                      </div>

                      <div>
                        <ImageUpload
                          value={affiliate.image_url || ''}
                          onChange={(url) => updateLocal(affiliate.id, { image_url: url })}
                          label="Banner Image"
                          storagePath="banners"
                        />
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <Collapsible open={expandedAdvanced[affiliate.id]} onOpenChange={() => setExpandedAdvanced(prev => ({ ...prev, [affiliate.id]: !prev[affiliate.id] }))}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs text-muted-foreground hover:text-foreground">
                          <span className="flex items-center gap-1.5">
                            <Settings2 className="h-3.5 w-3.5" />
                            Advanced Settings
                          </span>
                          <span>{expandedAdvanced[affiliate.id] ? '▲' : '▼'}</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-3">
                        <div>
                          <Label className="text-xs">HTML Embed Code (optional)</Label>
                          <Textarea
                            value={affiliate.html_embed || ''}
                            onChange={(e) => updateLocal(affiliate.id, { html_embed: e.target.value })}
                            placeholder="Paste HTML embed code..."
                            rows={3}
                            className="font-mono text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Show to Countries (empty = all)</Label>
                            <CountryMultiSelect
                              value={affiliate.target_countries}
                              onChange={(value) => updateLocal(affiliate.id, { target_countries: value })}
                              placeholder="Select target countries..."
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Exclude Countries</Label>
                            <CountryMultiSelect
                              value={affiliate.exclude_countries}
                              onChange={(value) => updateLocal(affiliate.id, { exclude_countries: value })}
                              placeholder="Select countries to exclude..."
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Page URL Patterns (empty = all pages)</Label>
                          <Textarea
                            value={affiliate.target_page_patterns.join('\n')}
                            onChange={(e) => updateLocal(affiliate.id, {
                              target_page_patterns: e.target.value.split('\n').filter(p => p.trim())
                            })}
                            placeholder="*-to-thailand*&#10;/visa-guides/*"
                            rows={2}
                            className="font-mono text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Start Date</Label>
                            <Input
                              type="datetime-local"
                              value={affiliate.start_date ? affiliate.start_date.slice(0, 16) : ''}
                              onChange={(e) => updateLocal(affiliate.id, {
                                start_date: e.target.value ? new Date(e.target.value).toISOString() : null
                              })}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">End Date</Label>
                            <Input
                              type="datetime-local"
                              value={affiliate.end_date ? affiliate.end_date.slice(0, 16) : ''}
                              onChange={(e) => updateLocal(affiliate.id, {
                                end_date: e.target.value ? new Date(e.target.value).toISOString() : null
                              })}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Save button */}
                    {isDirty && (
                      <div className="flex justify-end pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => saveAffiliate(affiliate.id)}
                          disabled={isSaving}
                        >
                          <Save className="mr-1.5 h-3.5 w-3.5" />
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {localAffiliates.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No affiliate banners yet</p>
                  <Button onClick={addAffiliate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Banner
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
