import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { saveAffiliateBanner } from '@/lib/affiliate-banners.functions';
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
import { AffiliateCreativeEditor } from '@/components/admin/AffiliateCreativeEditor';
import { QUERY_KEYS, useSiteSettings } from '@/hooks/useSharedData';
import { normalizeImageUrl, validateAffiliateEmbed } from '@/lib/affiliate-embed';
import { BANNER_POSITION_OPTIONS, isHorizontalBannerPosition } from '@/lib/banner-placements';
import { CountryMultiSelect } from "@/components/admin/CountryMultiSelect";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function ensureProtocol(url: string): string {
  const input = url?.trim();
  if (!input) return "";

  const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;

  try {
    const parsedUrl = new URL(withProtocol);
    if (parsedUrl.hostname.toLowerCase() === "bazarid") {
      parsedUrl.hostname = "bazar.id";
    }
    return parsedUrl.toString();
  } catch {
    return withProtocol;
  }
}

interface AffiliateData {
  id: string;
  name: string;
  target_url: string;
  html_embed: string | null;
  image_url: string | null;
  is_active: boolean;
  click_count: number;
  position: string;
  positions: string[];
  target_countries: string[];
  exclude_countries: string[];
  target_page_patterns: string[];
  priority: number;
  start_date: string | null;
  end_date: string | null;
  impressions: number;
  affiliate_program?: string | null;
}

export default function MonetizationSettings({ programSlug, bannersOnly = false }: { programSlug?: string; bannersOnly?: boolean } = {}) {
  const queryClient = useQueryClient();
  const saveBanner = useServerFn(saveAffiliateBanner);
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
  const { data: sharedSettings } = useSiteSettings();

  useEffect(() => {
    if (!sharedSettings) return;
    setAdsenseCode(sharedSettings.adsense_code?.code || '');
    setGdprConsentCode(sharedSettings.gdpr_consent_code?.code || '');
  }, [sharedSettings]);

  useEffect(() => {
    loadSettings();
  }, [programSlug]);

  const loadSettings = async (refresh = false) => {
    try {
      const key = ['admin-affiliates', programSlug || 'all'];
      if (refresh) await queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
      const affiliateData = await queryClient.fetchQuery({
        queryKey: key,
        queryFn: async () => {
          let query = supabase.from('settings_affiliates').select('*');
          if (programSlug) query = query.eq('affiliate_program', programSlug);
          const { data, error } = await query.order('priority', { ascending: false });
          if (error) throw error;
          return data || [];
        },
        staleTime: 60_000,
      });

      const loaded = (affiliateData || []).filter(aff => !programSlug || aff.affiliate_program === programSlug).map(aff => {
        const positions = (aff as any).positions && (aff as any).positions.length > 0
          ? (aff as any).positions
          : (aff.position ? [aff.position] : []);
        return {
          ...aff,
          positions,
          target_countries: aff.target_countries || [],
          exclude_countries: aff.exclude_countries || [],
          target_page_patterns: aff.target_page_patterns || [],
          priority: aff.priority || 0,
          impressions: aff.impressions || 0,
        };
      });
      setAffiliates(loaded);
      setLocalAffiliates(loaded);
      setDirtyIds(new Set());
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
        name: 'Banner',
        target_url: 'https://example.com',
        position: 'sidebar-right',
        positions: ['sidebar-right'],
        is_active: false,
        html_embed: '',
        target_countries: [],
        exclude_countries: [],
        target_page_patterns: [],
        priority: 0,
        affiliate_program: programSlug || null,
      });
      if (error) throw error;
      await loadSettings(true);
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.affiliates });
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
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

    if (!aff.positions || aff.positions.length === 0) {
      toast({ title: "Validation Error", description: "Please select at least one banner placement (e.g. Sidebar Right, Horizontal, In-Content, or Footer).", variant: "destructive" });
      return;
    }

    setSavingIds(prev => new Set(prev).add(id));
    try {
      if (aff.html_embed?.trim()) {
        const embedError = validateAffiliateEmbed(aff.html_embed);
        if (embedError) throw new Error(embedError);
      } else if (!aff.image_url?.trim()) {
        throw new Error('Add a banner image or affiliate script before saving.');
      }
      const positions = (aff.positions || []).filter(Boolean);
      await saveBanner({ data: {
          id: aff.id,
          name: aff.name,
          target_url: ensureProtocol(aff.target_url),
          html_embed: aff.html_embed?.trim() || null,
          image_url: aff.html_embed?.trim() ? null : normalizeImageUrl(aff.image_url || ''),
          positions,
          priority: aff.priority,
          target_countries: aff.target_countries.filter(c => c !== '__placeholder'),
          exclude_countries: aff.exclude_countries,
          target_page_patterns: aff.target_page_patterns,
          start_date: aff.start_date,
          end_date: aff.end_date,
        } });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.affiliates });
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });

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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.affiliates });
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
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
      {!bannersOnly && <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Monetization</h1>
        <p className="text-sm text-muted-foreground">Manage ads, banners & affiliate links</p>
      </div>}

      <Tabs defaultValue="affiliates">
        {!bannersOnly && <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="affiliates">Affiliate Banners</TabsTrigger>
          <TabsTrigger value="adsense">AdSense</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR Consent</TabsTrigger>
        </TabsList>}

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
                        <Button variant="ghost" size="sm"
                          className="h-auto max-w-full justify-start truncate p-0 text-sm font-semibold hover:text-primary transition-colors text-left"
                          onClick={() => setEditingName(affiliate.id)}
                          title="Click to edit name"
                        >
                          {affiliate.name}
                        </Button>
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
                        <div>
                          <Label className="text-xs">Positions (pick one or more)</Label>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {BANNER_POSITION_OPTIONS.map((opt) => {
                              const selected = affiliate.positions.includes(opt.value);
                              return (
                                <Button variant={selected ? 'default' : 'outline'} size="sm"
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    const next = selected
                                      ? affiliate.positions.filter((p) => p !== opt.value)
                                      : [...affiliate.positions, opt.value];
                                    updateLocal(affiliate.id, { positions: next });
                                  }}
                                  className={`h-auto px-2.5 py-1 rounded-md border text-xs transition-colors ${
                                    selected
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background hover:bg-muted border-input text-foreground'
                                  }`}
                                >
                                  {opt.label}
                                </Button>
                              );
                            })}
                          </div>
                          {affiliate.positions.length === 0 && (
                            <p className="text-xs text-destructive mt-1">Select at least one position.</p>
                          )}
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
                        {affiliate.target_url && affiliate.target_url !== 'https://example.com' && (
                          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                            <a href={ensureProtocol(affiliate.target_url)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1.5 h-3 w-3" />
                              Preview Link
                            </a>
                          </Button>
                        )}
                      </div>

                      <div>
                        <AffiliateCreativeEditor
                          image={affiliate.image_url || ''}
                          code={affiliate.html_embed || ''}
                          onChange={(updates) => updateLocal(affiliate.id, updates)}
                          maxWidth={affiliate.positions.some(p => p.startsWith('sidebar')) ? 800 : 1200}
                          maxHeight={affiliate.positions.some(isHorizontalBannerPosition) ? 400 : affiliate.positions.some(p => p.startsWith('sidebar')) ? 1200 : 600}
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
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={affiliate.target_countries.length === 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateLocal(affiliate.id, { target_countries: [] });
                                }
                              }}
                            />
                            <Label className="text-xs font-medium">Show to All Countries</Label>
                          </div>

                          {affiliate.target_countries.length > 0 && (
                            <div>
                              <Label className="text-xs">Target Countries</Label>
                              <CountryMultiSelect
                                value={affiliate.target_countries}
                                onChange={(value) => updateLocal(affiliate.id, { target_countries: value })}
                                placeholder="Select target countries..."
                              />
                            </div>
                          )}

                          {affiliate.target_countries.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              Ad is displayed globally.{' '}
                              <button
                                type="button"
                                className="text-primary hover:underline"
                                onClick={() => updateLocal(affiliate.id, { target_countries: ['__placeholder'] })}
                              >
                                Restrict to specific countries
                              </button>
                            </p>
                          )}

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
                          disabled={isSaving || affiliate.positions.length === 0}
                          title={affiliate.positions.length === 0 ? 'Select at least one placement to save' : undefined}
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
