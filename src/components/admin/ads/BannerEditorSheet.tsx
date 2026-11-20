import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AffiliateCreativeEditor } from '@/components/admin/AffiliateCreativeEditor';
import { CountryMultiSelect } from '@/components/admin/CountryMultiSelect';
import { BANNER_POSITION_OPTIONS, isHorizontalBannerPosition, type BannerPosition } from '@/lib/banner-placements';
import { slugifyBrand } from '@/lib/banner-rows';

export interface BannerDraft {
  id?: string;
  name: string;
  target_url: string;
  html_embed: string | null;
  image_url: string | null;
  positions: string[];
  priority: number;
  target_countries: string[];
  exclude_countries: string[];
  target_page_patterns: string[];
  start_date: string | null;
  end_date: string | null;
  affiliate_program: string | null;
}

export const EMPTY_BANNER: BannerDraft = {
  name: '', target_url: '', html_embed: '', image_url: '', positions: ['sidebar-right'], priority: 1,
  target_countries: [], exclude_countries: [], target_page_patterns: [], start_date: null, end_date: null,
  affiliate_program: null,
};

export interface Brand { id: string; name: string; slug: string; partner_id: string | null }

export function useBrands() {
  return useQuery({
    queryKey: ['affiliate-programs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('affiliate_programs').select('id, name, slug, partner_id').order('name');
      if (error) throw error;
      return (data || []) as Brand[];
    },
    staleTime: 5 * 60_000,
  });
}

const NO_BRAND = '__none';

export function BannerEditorSheet({ open, initial, onOpenChange, onSave }: {
  open: boolean;
  initial: BannerDraft | null;
  onOpenChange: (open: boolean) => void;
  onSave: (draft: BannerDraft) => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { data: brands = [] } = useBrands();
  const [draft, setDraft] = useState<BannerDraft>(EMPTY_BANNER);
  const [saving, setSaving] = useState(false);
  const [addingBrand, setAddingBrand] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandPartner, setBrandPartner] = useState('');

  useEffect(() => {
    if (open) { setDraft(initial ?? EMPTY_BANNER); setAddingBrand(false); }
  }, [open, initial]);

  const set = (u: Partial<BannerDraft>) => setDraft(d => ({ ...d, ...u }));

  const createBrand = async () => {
    const slug = slugifyBrand(brandName);
    if (!slug) return;
    const { error } = await supabase.from('affiliate_programs').insert({ name: brandName.trim(), slug, partner_id: brandPartner.trim() || null });
    if (error) { toast.error(error.message); return; }
    await queryClient.invalidateQueries({ queryKey: ['affiliate-programs'] });
    set({ affiliate_program: slug });
    setAddingBrand(false); setBrandName(''); setBrandPartner('');
    toast.success('Brand added');
  };

  const submit = async () => {
    if (!draft.name.trim()) { toast.error('Give the banner a name.'); return; }
    if (draft.positions.length === 0) { toast.error('Pick at least one placement.'); return; }
    setSaving(true);
    try { await onSave(draft); } finally { setSaving(false); }
  };

  const sidebar = draft.positions.some(p => p.startsWith('sidebar'));
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[560px]">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle>{draft.id ? 'Edit banner' : 'New banner'}</SheetTitle>
          <SheetDescription>Creative, placements and targeting.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="banner-name">Banner name</Label>
              <Input id="banner-name" value={draft.name} onChange={e => set({ name: e.target.value })} placeholder="e.g. Upflare hosting 728x90" />
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select value={draft.affiliate_program ?? NO_BRAND} onValueChange={v => {
                if (v === '__add') { setAddingBrand(true); return; }
                set({ affiliate_program: v === NO_BRAND ? null : v });
              }}>
                <SelectTrigger aria-label="Brand"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_BRAND}>Direct / no brand</SelectItem>
                  {brands.map(b => <SelectItem key={b.id} value={b.slug}>{b.name}</SelectItem>)}
                  <SelectItem value="__add">+ Add new brand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {addingBrand && (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">New brand</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input aria-label="Brand name" value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Brand name" />
                <Input aria-label="Partner ID" value={brandPartner} onChange={e => setBrandPartner(e.target.value)} placeholder="Partner ID (optional)" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={createBrand} disabled={!slugifyBrand(brandName)}><Plus className="mr-1 h-3.5 w-3.5" />Add brand</Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingBrand(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <AffiliateCreativeEditor
            key={draft.id ?? 'new'}
            image={draft.image_url || ''}
            code={draft.html_embed || ''}
            onChange={u => set(u)}
            maxWidth={sidebar ? 800 : 1200}
            maxHeight={draft.positions.some(isHorizontalBannerPosition) ? 400 : sidebar ? 1200 : 600}
          />

          {!draft.html_embed?.trim() && (
            <div className="space-y-1.5">
              <Label htmlFor="banner-target">Click-through link</Label>
              <Input id="banner-target" value={draft.target_url} onChange={e => set({ target_url: e.target.value })} placeholder="https://partner.com/?ref=visasguide" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Placements</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {BANNER_POSITION_OPTIONS.map(opt => {
                const checked = draft.positions.includes(opt.value);
                return (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50">
                    <Checkbox checked={checked} onCheckedChange={() => set({
                      positions: checked ? draft.positions.filter(p => p !== opt.value) : [...draft.positions, opt.value as BannerPosition],
                    })} />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between px-0 text-muted-foreground">
                Targeting & schedule (optional) <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="banner-priority">Priority (higher shows more often)</Label>
                <Input id="banner-priority" type="number" value={draft.priority} onChange={e => set({ priority: parseInt(e.target.value) || 0 })} className="w-28" />
              </div>
              <div className="space-y-1.5">
                <Label>Only show in these countries (empty = everywhere)</Label>
                <CountryMultiSelect value={draft.target_countries} onChange={v => set({ target_countries: v })} placeholder="All countries" />
              </div>
              <div className="space-y-1.5">
                <Label>Hide in these countries</Label>
                <CountryMultiSelect value={draft.exclude_countries} onChange={v => set({ exclude_countries: v })} placeholder="None" />
              </div>
              <div className="space-y-1.5">
                <Label>Page URL patterns (one per line, empty = all pages)</Label>
                <Textarea rows={2} className="font-mono text-xs" value={draft.target_page_patterns.join('\n')}
                  onChange={e => set({ target_page_patterns: e.target.value.split('\n').filter(p => p.trim()) })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Start</Label>
                  <Input type="datetime-local" value={draft.start_date?.slice(0, 16) ?? ''} onChange={e => set({ start_date: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
                <div className="space-y-1.5">
                  <Label>End</Label>
                  <Input type="datetime-local" value={draft.end_date?.slice(0, 16) ?? ''} onChange={e => set({ end_date: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-5 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save banner'}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
