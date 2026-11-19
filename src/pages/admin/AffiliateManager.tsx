import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Edit2, Save, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import MonetizationSettings from './MonetizationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCountries } from '@/hooks/useSharedData';

interface AffiliateProgram {
  id: string;
  name: string;
  slug: string;
  partner_id: string | null;
  description: string | null;
  is_active: boolean;
}

interface AffiliateWidget {
  id: string;
  affiliate_program: string;
  city_id: string | null;
  country_id: string | null;
  widget_url: string;
  widget_type: string;
  widget_variant: string;
  tour_id: string | null;
  position: string;
  is_active: boolean;
  city?: { id: string; name: string; country: { name: string } };
  country?: { id: string; name: string };
}

interface City {
  id: string;
  name: string;
  country: { id: string; name: string };
}

interface Country {
  id: string;
  name: string;
}

const AffiliateManager = () => {
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState<AffiliateProgram | null>(null);
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({ name: '', slug: '', partner_id: '', description: '' });
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [newWidget, setNewWidget] = useState<Partial<AffiliateWidget> | null>(null);

  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ['affiliate-programs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('affiliate_programs').select('*').order('name');
      if (error) throw error;
      return data as AffiliateProgram[];
    }
  });

  const { data: widgets = [], isLoading: loadingWidgets } = useQuery({
    queryKey: ['affiliate-widgets', selectedProgram?.slug],
    queryFn: async () => {
      if (!selectedProgram) return [];
      const { data, error } = await supabase
        .from('affiliate_widgets')
        .select(`*, city:cities(id, name, country:countries(id, name)), country:countries(id, name)`)
        .eq('affiliate_program', selectedProgram.slug)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AffiliateWidget[];
    },
    enabled: selectedProgram?.slug === 'getyourguide'
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities-for-affiliate'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('id, name, country:countries(id, name)').order('name');
      if (error) throw error;
      return data as City[];
    },
    enabled: selectedProgram?.slug === 'getyourguide',
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: countries = [] } = useCountries();

  const { data: widgetCounts = {} } = useQuery({
    queryKey: ['widget-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('affiliate_widgets').select('affiliate_program');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach(w => { counts[w.affiliate_program] = (counts[w.affiliate_program] || 0) + 1; });
      return counts;
    }
  });

  const addProgramMutation = useMutation({
    mutationFn: async (program: typeof newProgram) => {
      const { error } = await supabase.from('affiliate_programs').insert({
        name: program.name,
        slug: program.slug.toLowerCase().replace(/\s+/g, '-'),
        partner_id: program.partner_id || null,
        description: program.description || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-programs'] });
      setShowAddProgram(false);
      setNewProgram({ name: '', slug: '', partner_id: '', description: '' });
      toast.success('Affiliate program added');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const addWidgetMutation = useMutation({
    mutationFn: async (widget: Partial<AffiliateWidget>) => {
      if (!selectedProgram) throw new Error('Select an affiliate program first');
      const { error } = await supabase.from('affiliate_widgets').insert({
        affiliate_program: selectedProgram.slug,
        city_id: widget.city_id || null,
        country_id: widget.country_id || null,
        widget_url: widget.widget_url || '',
        widget_type: widget.widget_type || 'city',
        widget_variant: widget.widget_variant || 'city',
        tour_id: widget.tour_id || null,
        position: widget.position || 'main-content'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-widgets'] });
      queryClient.invalidateQueries({ queryKey: ['widget-counts'] });
      setNewWidget(null);
      toast.success('Widget added');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const updateWidgetMutation = useMutation({
    mutationFn: async (widget: Partial<AffiliateWidget> & { id: string }) => {
      const { error } = await supabase.from('affiliate_widgets').update({
        city_id: widget.city_id || null,
        country_id: widget.country_id || null,
        widget_url: widget.widget_url,
        widget_type: widget.widget_type,
        widget_variant: widget.widget_variant,
        tour_id: widget.tour_id || null,
        position: widget.position,
        is_active: widget.is_active
      }).eq('id', widget.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-widgets'] });
      setEditingWidget(null);
      toast.success('Widget updated');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const deleteWidgetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('affiliate_widgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-widgets'] });
      queryClient.invalidateQueries({ queryKey: ['widget-counts'] });
      toast.success('Widget deleted');
    },
    onError: (error: Error) => toast.error(error.message)
  });

  if (!selectedProgram) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Affiliate Manager</h1>
            <p className="text-muted-foreground">Manage affiliate programs and widgets</p>
          </div>
          <Dialog open={showAddProgram} onOpenChange={setShowAddProgram}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Affiliate</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Affiliate Program</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Program Name</Label><Input value={newProgram.name} onChange={e => setNewProgram(p => ({ ...p, name: e.target.value }))} placeholder="Affiliate name" /></div>
                <div><Label>Slug</Label><Input value={newProgram.slug} onChange={e => setNewProgram(p => ({ ...p, slug: e.target.value }))} placeholder="affiliate-name" /></div>
                <div><Label>Partner ID (optional)</Label><Input value={newProgram.partner_id} onChange={e => setNewProgram(p => ({ ...p, partner_id: e.target.value }))} placeholder="Your affiliate account ID" /></div>
                <div><Label>Description (optional)</Label><Input value={newProgram.description} onChange={e => setNewProgram(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" /></div>
                <Button onClick={() => addProgramMutation.mutate(newProgram)} disabled={!newProgram.name || !newProgram.slug} className="w-full">Add Program</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {loadingPrograms ? (<p className="text-muted-foreground">Loading programs...</p>) : programs.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No affiliate programs yet. Add one to get started.</CardContent></Card>
          ) : (
            programs.map(program => (
              <Card key={program.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedProgram(program)}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Ticket className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold">{program.name}</h3>
                      <p className="text-sm text-muted-foreground">Partner ID: {program.partner_id || 'Not set'} • {widgetCounts[program.slug] || 0} widgets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={program.is_active ? 'default' : 'secondary'}>{program.is_active ? 'Active' : 'Inactive'}</Badge>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedProgram(null)}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedProgram.name}</h1>
            <p className="text-muted-foreground">Partner ID: {selectedProgram.partner_id || 'Not set'}</p>
          </div>
        </div>
      </div>

      <Tabs key={selectedProgram.slug} defaultValue={selectedProgram.slug === 'getyourguide' ? 'widgets' : 'banners'}>
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          {selectedProgram.slug === 'getyourguide' && <TabsTrigger value="widgets">GetYourGuide Widgets</TabsTrigger>}
        </TabsList>
        <TabsContent value="banners"><MonetizationSettings programSlug={selectedProgram.slug} bannersOnly /></TabsContent>
        {selectedProgram.slug === 'getyourguide' && <TabsContent value="widgets">
      <div className="mb-4 flex justify-end"><Button onClick={() => setNewWidget({ widget_variant: 'city', position: 'main-content' })}><Plus className="h-4 w-4 mr-2" /> Add Widget</Button></div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Widget URL / Tour ID</th>
                  <th className="text-left p-3 font-medium">Position</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {newWidget && <WidgetRow widget={newWidget as AffiliateWidget} cities={cities} countries={countries} isNew onSave={(w) => addWidgetMutation.mutate(w)} onCancel={() => setNewWidget(null)} />}
                {loadingWidgets ? (<tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Loading...</td></tr>) : widgets.length === 0 && !newWidget ? (<tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No widgets configured</td></tr>) : (
                  widgets.map(widget => (<WidgetRow key={widget.id} widget={widget} cities={cities} countries={countries} isEditing={editingWidget === widget.id} onEdit={() => setEditingWidget(widget.id)} onSave={(w) => updateWidgetMutation.mutate({ ...w, id: widget.id })} onCancel={() => setEditingWidget(null)} onDelete={() => deleteWidgetMutation.mutate(widget.id)} />))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </TabsContent>}
      </Tabs>
    </div>
  );
};

const WidgetRow = ({ widget, cities, countries, isNew, isEditing, onEdit, onSave, onCancel, onDelete }: { widget: AffiliateWidget; cities: City[]; countries: Country[]; isNew?: boolean; isEditing?: boolean; onEdit?: () => void; onSave: (w: Partial<AffiliateWidget>) => void; onCancel: () => void; onDelete?: () => void; }) => {
  const [localWidget, setLocalWidget] = useState<Partial<AffiliateWidget>>(widget);
  const isEditMode = isNew || isEditing;

  useEffect(() => { setLocalWidget(widget); }, [widget]);

  if (!isEditMode) {
    return (
      <tr className="hover:bg-muted/30">
        <td className="p-3">{widget.city ? `${widget.city.name}, ${widget.city.country?.name}` : widget.country?.name || 'Not set'}</td>
        <td className="p-3"><Badge variant="outline">{widget.widget_variant === 'availability' ? 'Featured Tour' : 'City Activities'}</Badge></td>
        <td className="p-3"><span className="text-sm text-muted-foreground truncate max-w-[200px] block">{widget.tour_id || widget.widget_url}</span></td>
        <td className="p-3 capitalize">{widget.position.replace('-', ' ')}</td>
        <td className="p-3"><Badge variant={widget.is_active ? 'default' : 'secondary'}>{widget.is_active ? 'Active' : 'Inactive'}</Badge></td>
        <td className="p-3 text-right space-x-2">
          <Button variant="ghost" size="icon" onClick={onEdit}><Edit2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-primary/5">
      <td className="p-3">
        <Select value={localWidget.city_id || localWidget.country_id || ''} onValueChange={(value) => { const city = cities.find(c => c.id === value); if (city) { setLocalWidget(w => ({ ...w, city_id: value, country_id: null })); } else { setLocalWidget(w => ({ ...w, country_id: value, city_id: null })); } }}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select location" /></SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Cities</div>
            {cities.map(city => (<SelectItem key={city.id} value={city.id}>{city.name}, {city.country?.name}</SelectItem>))}
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">Countries</div>
            {countries.map(country => (<SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        <Select value={localWidget.widget_variant || 'city'} onValueChange={(value) => setLocalWidget(w => ({ ...w, widget_variant: value }))}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="city">City Activities</SelectItem>
            <SelectItem value="availability">Featured Tour</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3">
        {localWidget.widget_variant === 'availability' ? (
          <Input value={localWidget.tour_id || ''} onChange={e => setLocalWidget(w => ({ ...w, tour_id: e.target.value }))} placeholder="Tour ID (e.g., 280242)" className="w-[180px]" />
        ) : (
          <Input value={localWidget.widget_url || ''} onChange={e => setLocalWidget(w => ({ ...w, widget_url: e.target.value }))} placeholder="Widget URL" className="w-[250px]" />
        )}
      </td>
      <td className="p-3">
        <Select value={localWidget.position || 'main-content'} onValueChange={(value) => setLocalWidget(w => ({ ...w, position: value }))}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="main-content">Main Content</SelectItem>
            <SelectItem value="after-attractions">After Attractions</SelectItem>
            <SelectItem value="sidebar">Sidebar</SelectItem>
            <SelectItem value="bottom-cta">Bottom CTA</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3"><Switch checked={localWidget.is_active !== false} onCheckedChange={(checked) => setLocalWidget(w => ({ ...w, is_active: checked }))} /></td>
      <td className="p-3 text-right space-x-2">
        <Button size="sm" onClick={() => { if (localWidget.widget_variant === 'availability' && !localWidget.tour_id) { toast.error('Tour ID required'); return; } if (localWidget.widget_variant !== 'availability' && !localWidget.widget_url) { toast.error('Widget URL required'); return; } onSave(localWidget); }}><Save className="h-4 w-4 mr-1" /> Save</Button>
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </td>
    </tr>
  );
};

export default AffiliateManager;
