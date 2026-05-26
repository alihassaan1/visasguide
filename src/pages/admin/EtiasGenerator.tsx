import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CountryRow { country_slug: string; country_name: string; nationality: string; is_published: boolean }

const EtiasGenerator = () => {
  const [rows, setRows] = useState<CountryRow[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase
      .from("etias_country_pages")
      .select("country_slug,country_name,nationality,is_published")
      .order("country_slug");
    setRows((data ?? []) as CountryRow[]);
  };

  useEffect(() => { load(); }, []);

  const run = async (opts: { force?: boolean; limit?: number } = {}) => {
    setRunning(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-generate-etias-countries", { body: opts });
      if (error) throw error;
      setResult(data);
      toast.success(`Generated ${data?.succeeded ?? 0} pages (${data?.failed ?? 0} failed)`);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Generation failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">ETIAS Country Page Generator</h1>
        <p className="text-muted-foreground mt-1">
          Bulk-generates `/etias/for/:countrySlug` pages for all ~60 visa-waiver nationalities using Lovable AI (Gemini).
          Existing pages are skipped unless you choose "Force regenerate".
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => run()} disabled={running}>
          {running && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Generate missing country pages
        </Button>
        <Button variant="outline" onClick={() => run({ limit: 5 })} disabled={running}>
          Test run (next 5 missing)
        </Button>
        <Button variant="destructive" onClick={() => run({ force: true })} disabled={running}>
          Force regenerate all
        </Button>
      </div>

      {result && (
        <Card className="p-4">
          <div className="text-sm">
            <strong>Attempted:</strong> {result.attempted} • <strong>Succeeded:</strong> {result.succeeded} • <strong>Failed:</strong> {result.failed}
          </div>
          {result.results?.filter((r: any) => r.status === "error").length > 0 && (
            <div className="mt-2 text-xs text-destructive space-y-1">
              {result.results.filter((r: any) => r.status === "error").map((r: any) => (
                <div key={r.slug}>{r.slug}: {r.error}</div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Published country pages ({rows.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {rows.map((r) => (
            <div key={r.country_slug} className="flex items-center justify-between border rounded px-3 py-2">
              <span>{r.country_name}</span>
              {r.is_published
                ? <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" />live</Badge>
                : <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />draft</Badge>}
            </div>
          ))}
          {rows.length === 0 && <div className="text-muted-foreground">No country pages yet.</div>}
        </div>
      </Card>
    </div>
  );
};

export default EtiasGenerator;
