import { useCountries } from "@/hooks/useSharedData";
import { useState } from "react";
import { useSearchParams, Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, Bell, Info, AlertCircle, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

const TYPE_LABELS: Record<string, string> = {
  visa_free_added: "Visa-Free Added",
  visa_free_removed: "Visa-Free Removed",
  evisa_launched: "eVisa Launched",
  fee_change: "Fee Change",
  processing_time_change: "Processing Time",
  entry_ban: "Entry Ban",
  requirement_change: "Requirement Change",
  policy_announcement: "Announcement",
};

const severityIcon = (s: string) => {
  if (s === "critical") return <AlertCircle className="h-4 w-4 text-destructive" />;
  if (s === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  if (s === "update") return <Bell className="h-4 w-4 text-blue-600" />;
  return <Info className="h-4 w-4 text-muted-foreground" />;
};

export default function PolicyUpdates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const countrySlug = searchParams.get("country") || "all";
  const changeType = searchParams.get("type") || "all";
  const severity = searchParams.get("severity") || "all";

  const { data: countries } = useCountries();

  const { data: changes, isLoading } = useQuery({
    queryKey: ["policy-updates-public", countrySlug, changeType, severity],
    queryFn: async () => {
      let q = supabase
        .from("visa_policy_changes")
        .select("*, countries(name, slug, flag_emoji), news_articles(slug)")
        .eq("is_published", true)
        .order("announcement_date", { ascending: false })
        .limit(100);
      if (countrySlug !== "all" && countries) {
        const c = countries.find((x: any) => x.slug === countrySlug);
        if (c) q = q.eq("country_id", c.id);
      }
      if (changeType !== "all") q = q.eq("change_type", changeType as any);
      if (severity !== "all") q = q.eq("severity", severity as any);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!countries,
  });

  const filtered = (changes || []).filter((c: any) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.summary.toLowerCase().includes(search.toLowerCase())
  );

  const updateParam = (k: string, v: string) => {
    const next = new URLSearchParams(searchParams);
    if (v === "all") next.delete(k); else next.set(k, v);
    setSearchParams(next);
  };

  // Dataset schema for SEO
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Global Visa Policy Changes",
    description: "Live timeline of visa policy changes, entry rule updates, and immigration announcements from countries worldwide.",
    url: "https://visas.guide/policy-updates",
    creator: { "@type": "Organization", name: "visas.guide" },
    keywords: ["visa policy", "visa updates", "immigration changes", "entry rules"],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Visa Policy Updates 2026 — Latest Changes Worldwide | visas.guide"
        description="Live tracker of visa policy changes, fee updates, eVisa launches and entry rule changes from every country. Updated daily."
        canonical="https://visas.guide/policy-updates"
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Policy Updates", url: "/policy-updates" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Visa Policy Updates</h1>
          <p className="text-muted-foreground text-lg">
            Real-time global tracker of visa rule changes, fee updates, eVisa launches and entry policy announcements.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Search updates…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={countrySlug} onValueChange={(v) => updateParam("country", v)}>
              <SelectTrigger><SelectValue placeholder="All countries" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">All countries</SelectItem>
                {(countries || []).map((c: any) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={changeType} onValueChange={(v) => updateParam("type", v)}>
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={severity} onValueChange={(v) => updateParam("severity", v)}>
              <SelectTrigger><SelectValue placeholder="All severities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">No policy updates match your filters yet.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((c: any) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{severityIcon(c.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-xs">{TYPE_LABELS[c.change_type]}</Badge>
                        {c.countries && (
                          <Link to={`/countries/${c.countries.slug}`} className="text-sm font-medium hover:underline">
                            {c.countries.flag_emoji} {c.countries.name}
                          </Link>
                        )}
                        <span className="text-xs text-muted-foreground">{c.announcement_date}</span>
                        {c.effective_date && (
                          <span className="text-xs text-muted-foreground">• Effective: {c.effective_date}</span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold mb-1">
                        {c.news_articles?.slug ? (
                          <Link to={`/blog/${c.news_articles.slug}`} className="hover:underline">{c.title}</Link>
                        ) : c.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">{c.summary}</p>
                      <div className="flex gap-3 mt-2">
                        {c.news_articles?.slug && (
                          <Link to={`/blog/${c.news_articles.slug}`} className="text-xs text-primary hover:underline">Read full article →</Link>
                        )}
                        {c.source_url && (
                          <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1">
                            Source <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
