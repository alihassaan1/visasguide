import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Plus, RefreshCw, ExternalLink } from "lucide-react";

const CHANGE_TYPES = [
  { value: "visa_free_added", label: "Visa-Free Added" },
  { value: "visa_free_removed", label: "Visa-Free Removed" },
  { value: "evisa_launched", label: "eVisa Launched" },
  { value: "fee_change", label: "Fee Change" },
  { value: "processing_time_change", label: "Processing Time Change" },
  { value: "entry_ban", label: "Entry Ban" },
  { value: "requirement_change", label: "Requirement Change" },
  { value: "policy_announcement", label: "Policy Announcement" },
];

const SEVERITIES = ["info", "update", "warning", "critical"];

const severityColor = (s: string) =>
  s === "critical" ? "destructive" : s === "warning" ? "default" : s === "update" ? "secondary" : "outline";

export default function PolicyTracker() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("inbox");

  const { data: countries } = useQuery({
    queryKey: ["countries-min"],
    queryFn: async () => {
      const { data } = await supabase.from("countries").select("id, name, slug").order("name");
      return data || [];
    },
  });

  const { data: changes, isLoading } = useQuery({
    queryKey: ["policy-changes", tab],
    queryFn: async () => {
      let q = supabase
        .from("visa_policy_changes")
        .select("*, countries(name, slug), news_articles(slug, status)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (tab === "inbox") q = q.eq("is_verified", false);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, generate }: { id: string; generate: boolean }) => {
      const { error } = await supabase
        .from("visa_policy_changes")
        .update({ is_verified: true, verified_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      if (generate) {
        const { error: fnErr } = await supabase.functions.invoke("policy-article-generator", {
          body: { policy_change_id: id },
        });
        if (fnErr) throw fnErr;
      }
    },
    onSuccess: () => {
      toast.success("Approved & article queued");
      qc.invalidateQueries({ queryKey: ["policy-changes"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("visa_policy_changes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rejected");
      qc.invalidateQueries({ queryKey: ["policy-changes"] });
    },
  });

  const runDetector = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("policy-detector");
      if (error) throw error;
      return data;
    },
    onSuccess: (d: any) => {
      toast.success(`Scan complete: ${d.detected || 0} new policy changes detected`);
      qc.invalidateQueries({ queryKey: ["policy-changes"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Visa Policy Tracker</h1>
          <p className="text-muted-foreground">Detect, verify, and publish visa policy changes worldwide</p>
        </div>
        <Button onClick={() => runDetector.mutate()} disabled={runDetector.isPending}>
          {runDetector.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Run Detector
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="inbox">Inbox (Unverified)</TabsTrigger>
          <TabsTrigger value="all">All Changes</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <ChangesList
            changes={changes || []}
            isLoading={isLoading}
            onApprove={(id) => verifyMutation.mutate({ id, generate: true })}
            onReject={(id) => rejectMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <ChangesList changes={changes || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <ManualEntryForm countries={countries || []} onCreated={() => qc.invalidateQueries({ queryKey: ["policy-changes"] })} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChangesList({
  changes, isLoading, onApprove, onReject,
}: {
  changes: any[]; isLoading: boolean; onApprove?: (id: string) => void; onReject?: (id: string) => void;
}) {
  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (changes.length === 0) return <Card><CardContent className="p-12 text-center text-muted-foreground">No policy changes</CardContent></Card>;
  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs">{c.announcement_date}</TableCell>
                <TableCell>{c.countries?.name || "—"}</TableCell>
                <TableCell className="text-xs">{c.change_type}</TableCell>
                <TableCell className="max-w-xs">
                  <div className="font-medium text-sm">{c.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{c.summary}</div>
                </TableCell>
                <TableCell><Badge variant={severityColor(c.severity) as any}>{c.severity}</Badge></TableCell>
                <TableCell>
                  {c.is_published ? <Badge variant="default">Published</Badge> :
                   c.is_verified ? <Badge variant="secondary">Verified</Badge> :
                   <Badge variant="outline">Pending</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {onApprove && !c.is_verified && (
                      <Button size="sm" variant="outline" onClick={() => onApprove(c.id)}>
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                    {onReject && (
                      <Button size="sm" variant="outline" onClick={() => onReject(c.id)}>
                        <XCircle className="h-3 w-3" />
                      </Button>
                    )}
                    {c.source_url && (
                      <a href={c.source_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost"><ExternalLink className="h-3 w-3" /></Button>
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ManualEntryForm({ countries, onCreated }: { countries: any[]; onCreated: () => void }) {
  const [form, setForm] = useState({
    country_id: "",
    change_type: "policy_announcement",
    title: "",
    summary: "",
    full_description: "",
    effective_date: "",
    severity: "update",
    source_url: "",
    source_name: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("visa_policy_changes")
        .insert({
          ...form,
          country_id: form.country_id || null,
          effective_date: form.effective_date || null,
          source_type: "manual",
          is_verified: true,
          verified_at: new Date().toISOString(),
          announcement_date: new Date().toISOString().split("T")[0],
        } as any)
        .select("id")
        .single();
      if (error) throw error;
      await supabase.functions.invoke("policy-article-generator", { body: { policy_change_id: data.id } });
      return data;
    },
    onSuccess: () => {
      toast.success("Created — article generation started");
      setForm({ country_id: "", change_type: "policy_announcement", title: "", summary: "", full_description: "", effective_date: "", severity: "update", source_url: "", source_name: "" });
      onCreated();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a Policy Change Manually</CardTitle>
        <CardDescription>Creates the entry and auto-generates an SEO article</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Country</Label>
            <Select value={form.country_id} onValueChange={(v) => setForm({ ...form, country_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {countries.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Change Type</Label>
            <Select value={form.change_type} onValueChange={(v) => setForm({ ...form, change_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CHANGE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Severity</Label>
            <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Effective Date</Label>
            <Input type="date" value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="UAE waives visa fees for 87 nationalities" />
        </div>
        <div>
          <Label>Summary (1-2 sentences)</Label>
          <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
        </div>
        <div>
          <Label>Full Description</Label>
          <Textarea value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} rows={6} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Source URL</Label>
            <Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
          </div>
          <div>
            <Label>Source Name</Label>
            <Input value={form.source_name} onChange={(e) => setForm({ ...form, source_name: e.target.value })} placeholder="Reuters, gov.ae, etc." />
          </div>
        </div>
        <Button onClick={() => create.mutate()} disabled={create.isPending || !form.title || !form.summary}>
          {create.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Create & Generate Article
        </Button>
      </CardContent>
    </Card>
  );
}
