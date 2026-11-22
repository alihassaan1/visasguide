import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Code, Copy, Eye, MoreVertical, MousePointerClick, Pencil, Percent, Plus, Search, Trash2, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { saveAffiliateBanner } from '@/lib/affiliate-banners.functions';
import { QUERY_KEYS } from '@/hooks/useSharedData';
import { BANNER_POSITION_OPTIONS } from '@/lib/banner-placements';
import { bannerCtr, bannerKind } from '@/lib/banner-rows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BannerEditorSheet, EMPTY_BANNER, useBrands, type BannerDraft } from './BannerEditorSheet';

export interface BannerRow extends BannerDraft {
  id: string;
  is_active: boolean;
  impressions: number;
  click_count: number;
}

const positionLabel = (p: string) => BANNER_POSITION_OPTIONS.find(o => o.value === p)?.label.replace(' (Horizontal)', '') ?? p;

export const ADMIN_BANNERS_KEY = ['admin-affiliates', 'all'];

export function BannerList() {
  const queryClient = useQueryClient();
  const saveBanner = useServerFn(saveAffiliateBanner);
  const { data: brands = [] } = useBrands();
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [placement, setPlacement] = useState('all');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<BannerDraft | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<BannerRow | null>(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ADMIN_BANNERS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('settings_affiliates').select('*').order('priority', { ascending: false });
      if (error) throw error;
      return (data || []).map((a: any) => ({
        ...a,
        positions: a.positions?.length ? a.positions : a.position ? [a.position] : [],
        target_countries: a.target_countries || [],
        exclude_countries: a.exclude_countries || [],
        target_page_patterns: a.target_page_patterns || [],
        priority: a.priority || 0,
        impressions: a.impressions || 0,
        click_count: a.click_count || 0,
        affiliate_program: a.affiliate_program ?? null,
      })) as BannerRow[];
    },
    staleTime: 60_000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.affiliates });
  };

  const brandName = (slug: string | null) => brands.find(b => b.slug === slug)?.name ?? 'Direct';

  const rows = useMemo(() => banners.filter(b =>
    (brand === 'all' || (brand === 'direct' ? !b.affiliate_program : b.affiliate_program === brand)) &&
    (placement === 'all' || b.positions.includes(placement)) &&
    (status === 'all' || (status === 'active') === b.is_active) &&
    (!search.trim() || `${b.name} ${brandName(b.affiliate_program)}`.toLowerCase().includes(search.toLowerCase()))
  ), [banners, brand, placement, status, search, brands]);

  const totals = useMemo(() => banners.reduce((t, b) => ({
    impressions: t.impressions + b.impressions, click_count: t.click_count + b.click_count, active: t.active + (b.is_active ? 1 : 0),
  }), { impressions: 0, click_count: 0, active: 0 }), [banners]);

  const openEditor = (draft: BannerDraft) => { setEditing(draft); setSheetOpen(true); };

  const save = async (draft: BannerDraft) => {
    try {
      let id = draft.id;
      if (!id) {
        const { data, error } = await supabase.from('settings_affiliates').insert({
          name: draft.name, target_url: draft.target_url || 'https://visas.guide', position: draft.positions[0],
          positions: draft.positions, is_active: true, affiliate_program: draft.affiliate_program,
        }).select('id').single();
        if (error) throw error;
        id = data.id;
      }
      try {
        await saveBanner({ data: {
          id: id!, name: draft.name.trim(), target_url: draft.target_url || '',
          html_embed: draft.html_embed?.trim() || null,
          image_url: draft.html_embed?.trim() ? null : (draft.image_url || null),
          positions: draft.positions as any, priority: draft.priority,
          target_countries: draft.target_countries.filter(c => c !== '__placeholder'),
          exclude_countries: draft.exclude_countries, target_page_patterns: draft.target_page_patterns,
          start_date: draft.start_date, end_date: draft.end_date, affiliate_program: draft.affiliate_program,
        } });
      } catch (err) {
        if (!draft.id) await supabase.from('settings_affiliates').delete().eq('id', id!);
        throw err;
      }
      refresh();
      setSheetOpen(false);
      toast.success('Banner saved');
    } catch (error: any) {
      const msg = error?.message ?? 'Banner could not be saved.';
      toast.error(msg.startsWith('[') ? 'Please check the creative and link, then try again.' : msg);
    }
  };

  const toggle = async (row: BannerRow, is_active: boolean) => {
    queryClient.setQueryData<BannerRow[]>(ADMIN_BANNERS_KEY, old => old?.map(b => b.id === row.id ? { ...b, is_active } : b));
    const { error } = await supabase.from('settings_affiliates').update({ is_active }).eq('id', row.id);
    if (error) toast.error(error.message);
    refresh();
  };

  const duplicate = async (row: BannerRow) => {
    const { id, impressions, click_count, ...rest } = row as any;
    const { created_at, updated_at, ...copy } = rest;
    const { error } = await supabase.from('settings_affiliates').insert({ ...copy, name: `${row.name} (copy)`, is_active: false, impressions: 0, click_count: 0 });
    if (error) { toast.error(error.message); return; }
    refresh();
    toast.success('Copy created (paused)');
  };

  const remove = async () => {
    if (!deleting) return;
    const { error } = await supabase.from('settings_affiliates').delete().eq('id', deleting.id);
    setDeleting(null);
    if (error) { toast.error(error.message); return; }
    refresh();
    toast.success('Banner deleted');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Past views (paused)', value: totals.impressions.toLocaleString(), icon: Eye },
          { label: 'Clicks', value: totals.click_count.toLocaleString(), icon: MousePointerClick },
          { label: 'Average CTR', value: bannerCtr(totals), icon: Percent },
          { label: 'Active banners', value: `${totals.active} / ${banners.length}`, icon: Megaphone },
        ].map(k => (
          <Card key={k.label} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><k.icon className="h-3.5 w-3.5" />{k.label}</div>
            <p className="mt-1 text-xl font-semibold tabular-nums">{k.value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Search banners" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search banners" className="pl-8" />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex">
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger aria-label="Filter by brand" className="lg:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              {brands.map(b => <SelectItem key={b.id} value={b.slug}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={placement} onValueChange={setPlacement}>
            <SelectTrigger aria-label="Filter by placement" className="lg:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All placements</SelectItem>
              {BANNER_POSITION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{positionLabel(o.value)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Filter by status" className="lg:w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => openEditor({ ...EMPTY_BANNER })}><Plus className="mr-1.5 h-4 w-4" />Add banner</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[1fr_auto_minmax(0,220px)_90px_70px_70px_110px] items-center gap-4 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground lg:grid">
          <span>Banner</span><span>Type</span><span>Placements</span>
          <span className="text-right" title="View counting is paused; numbers are historical">Past views</span><span className="text-right">Clicks</span><span className="text-right">CTR</span><span className="text-right">Status</span>
        </div>
        {isLoading && <p className="p-6 text-center text-sm text-muted-foreground">Loading banners…</p>}
        {!isLoading && rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No banners match. Add one to get started.</p>}
        <ul className="divide-y">
          {rows.map(row => {
            const kind = bannerKind(row);
            return (
              <li key={row.id} data-testid="banner-row"
                className="grid cursor-pointer grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 lg:grid-cols-[56px_1fr_auto_minmax(0,220px)_90px_70px_70px_110px] lg:gap-4"
                onClick={() => openEditor(row)}>
                <div className="flex h-9 w-14 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {kind === 'image' && row.image_url
                    ? <img src={row.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    : <Code className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{row.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {brandName(row.affiliate_program)}
                    <span className="lg:hidden"> · {row.impressions.toLocaleString()} views · {row.click_count.toLocaleString()} clicks · {bannerCtr(row)}</span>
                  </p>
                </div>
                <Badge variant="outline" className="hidden font-normal lg:inline-flex">{kind === 'script' ? 'Script' : 'Image'}</Badge>
                <div className="hidden flex-wrap gap-1 lg:flex">
                  {row.positions.map(p => <Badge key={p} variant="secondary" className="font-normal">{positionLabel(p)}</Badge>)}
                </div>
                <span className="hidden text-right text-sm tabular-nums lg:block">{row.impressions.toLocaleString()}</span>
                <span className="hidden text-right text-sm tabular-nums lg:block">{row.click_count.toLocaleString()}</span>
                <span className="hidden text-right text-sm tabular-nums lg:block">{bannerCtr(row)}</span>
                <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                  <Switch aria-label={`${row.is_active ? 'Pause' : 'Activate'} ${row.name}`} checked={row.is_active} onCheckedChange={v => toggle(row, v)} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${row.name}`}><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditor(row)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggle(row, !row.is_active)}><Eye className="mr-2 h-4 w-4" />{row.is_active ? 'Disable' : 'Enable'}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicate(row)}><Copy className="mr-2 h-4 w-4" />Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleting(row)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <BannerEditorSheet open={sheetOpen} initial={editing} onOpenChange={setSheetOpen} onSave={save} />

      <AlertDialog open={!!deleting} onOpenChange={o => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>The banner and its stats are removed from every page. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
