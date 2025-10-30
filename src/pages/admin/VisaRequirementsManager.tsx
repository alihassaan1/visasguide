import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function VisaRequirementsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    from_country_id: "",
    to_country_id: "",
    requirement_type: "visa_required",
    max_stay_days: "",
    processing_time_days: "",
    fee_usd: "",
    notes: "",
    requirements: ""
  });

  // Fetch all countries for dropdowns
  const { data: countries = [] } = useQuery({
    queryKey: ['countries-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name, code, flag_emoji')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch visa requirements
  const { data: visaRequirements = [], isLoading } = useQuery({
    queryKey: ['visa-requirements-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_requirements')
        .select(`
          *,
          from_country:countries!visa_requirements_from_country_id_fkey(id, name, code, flag_emoji),
          to_country:countries!visa_requirements_to_country_id_fkey(id, name, code, flag_emoji)
        `)
        .order('last_updated', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Add/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        from_country_id: data.from_country_id,
        to_country_id: data.to_country_id,
        requirement_type: data.requirement_type,
        max_stay_days: data.max_stay_days ? parseInt(data.max_stay_days) : null,
        processing_time_days: data.processing_time_days ? parseInt(data.processing_time_days) : null,
        fee_usd: data.fee_usd ? parseFloat(data.fee_usd) : null,
        notes: data.notes || null,
        requirements: data.requirements ? data.requirements.split(',').map((r: string) => r.trim()) : []
      };

      if (editingId) {
        const { error } = await supabase
          .from('visa_requirements')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('visa_requirements')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visa-requirements-admin'] });
      toast({
        title: editingId ? "Updated" : "Added",
        description: `Visa requirement ${editingId ? 'updated' : 'added'} successfully.`
      });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('visa_requirements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visa-requirements-admin'] });
      toast({
        title: "Deleted",
        description: "Visa requirement deleted successfully."
      });
    }
  });

  const resetForm = () => {
    setFormData({
      from_country_id: "",
      to_country_id: "",
      requirement_type: "visa_required",
      max_stay_days: "",
      processing_time_days: "",
      fee_usd: "",
      notes: "",
      requirements: ""
    });
    setEditingId(null);
  };

  const handleEdit = (req: any) => {
    setEditingId(req.id);
    setFormData({
      from_country_id: req.from_country_id,
      to_country_id: req.to_country_id,
      requirement_type: req.requirement_type,
      max_stay_days: req.max_stay_days?.toString() || "",
      processing_time_days: req.processing_time_days?.toString() || "",
      fee_usd: req.fee_usd?.toString() || "",
      notes: req.notes || "",
      requirements: req.requirements?.join(', ') || ""
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getRequirementBadge = (type: string) => {
    const colors: Record<string, string> = {
      visa_free: 'bg-green-500',
      visa_on_arrival: 'bg-yellow-500',
      eTA_required: 'bg-blue-500',
      evisa_required: 'bg-purple-500',
      visa_required: 'bg-red-500'
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.replace(/_/g, ' ')}</Badge>;
  };

  const filteredRequirements = visaRequirements.filter(req => 
    searchTerm === "" ||
    req.from_country?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.to_country?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Visa Requirements Manager</h1>
        <p className="text-muted-foreground">Add and manage visa requirements between countries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{visaRequirements.length}</div>
            <p className="text-sm text-muted-foreground">Total Requirements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{countries.length}</div>
            <p className="text-sm text-muted-foreground">Countries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{Math.round((visaRequirements.length / (countries.length * countries.length)) * 100)}%</div>
            <p className="text-sm text-muted-foreground">Database Coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by country name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Visa Requirement</DialogTitle>
              <DialogDescription>
                Enter the visa requirement details between two countries.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Country (Passport)</Label>
                  <Select value={formData.from_country_id} onValueChange={(value) => setFormData({...formData, from_country_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.flag_emoji} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>To Country (Destination)</Label>
                  <Select value={formData.to_country_id} onValueChange={(value) => setFormData({...formData, to_country_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.flag_emoji} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requirement Type</Label>
                <Select value={formData.requirement_type} onValueChange={(value) => setFormData({...formData, requirement_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa_free">Visa Free</SelectItem>
                    <SelectItem value="visa_on_arrival">Visa on Arrival</SelectItem>
                    <SelectItem value="eTA_required">eTA Required</SelectItem>
                    <SelectItem value="evisa_required">eVisa Required</SelectItem>
                    <SelectItem value="visa_required">Visa Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Stay (days)</Label>
                  <Input
                    type="number"
                    value={formData.max_stay_days}
                    onChange={(e) => setFormData({...formData, max_stay_days: e.target.value})}
                    placeholder="90"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Processing Time (days)</Label>
                  <Input
                    type="number"
                    value={formData.processing_time_days}
                    onChange={(e) => setFormData({...formData, processing_time_days: e.target.value})}
                    placeholder="15"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fee (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fee_usd}
                    onChange={(e) => setFormData({...formData, fee_usd: e.target.value})}
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requirements (comma-separated)</Label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="Valid passport, Travel insurance, Hotel booking, Financial proof"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional information about the visa requirement..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Add'} Requirement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visa Requirements ({filteredRequirements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredRequirements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No visa requirements found. Add your first one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Max Stay</TableHead>
                    <TableHead>Processing</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{req.from_country?.flag_emoji}</span>
                          <span>{req.from_country?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{req.to_country?.flag_emoji}</span>
                          <span>{req.to_country?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRequirementBadge(req.requirement_type)}</TableCell>
                      <TableCell>{req.max_stay_days ? `${req.max_stay_days} days` : '-'}</TableCell>
                      <TableCell>{req.processing_time_days ? `${req.processing_time_days} days` : '-'}</TableCell>
                      <TableCell>{req.fee_usd ? `$${req.fee_usd}` : 'Free'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(req)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteMutation.mutate(req.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
