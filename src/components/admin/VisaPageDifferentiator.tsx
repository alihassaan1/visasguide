import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Layers } from "lucide-react";

export function VisaPageDifferentiator() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [limit, setLimit] = useState(5);
  const [lastResult, setLastResult] = useState<any>(null);

  const run = async (dryRun = false) => {
    setRunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch(
        `https://awiytryceqehqapytfgn.supabase.co/functions/v1/differentiate-visa-pages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ limit, dryRun }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Differentiation failed");
      setLastResult(data);
      toast({
        title: dryRun ? "Preview Ready" : "Batch Complete",
        description: dryRun
          ? `${data.remaining} corridor pages still templated`
          : `Differentiated ${data.succeeded}/${data.processed} (${data.failed} failed). ${data.remaining} remaining.`,
      });
    } catch (e) {
      toast({
        title: "Failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Layers className="h-5 w-5" />
          Visa Corridor Differentiator
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Rewrites templated <code>/visa-requirements/*</code> pages with corridor-specific
          signals (embassy, fee table, timeline stages, alternatives, FAQs). Skips already
          differentiated pages. Each page ~10-15s. ~39k total — run hourly via cron later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="diff-limit" className="text-xs">Batch size (1–25)</Label>
            <Input
              id="diff-limit"
              type="number"
              min={1}
              max={25}
              value={limit}
              onChange={(e) => setLimit(Math.min(25, Math.max(1, Number(e.target.value) || 1)))}
              className="w-24"
            />
          </div>
          <Button onClick={() => run(true)} variant="outline" disabled={running}>
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Preview (dry-run)
          </Button>
          <Button onClick={() => run(false)} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Layers className="h-4 w-4 mr-2" />}
            Differentiate Next {limit}
          </Button>
        </div>

        {lastResult && (
          <div className="rounded-md border bg-muted/30 p-3 text-xs">
            <p className="font-medium mb-1">
              {lastResult.dryRun ? "Would differentiate:" : "Last batch results:"}
            </p>
            {lastResult.dryRun ? (
              <ul className="list-disc list-inside space-y-0.5 max-h-40 overflow-auto">
                {lastResult.wouldEnrich?.map((n: string) => <li key={n}>{n}</li>)}
              </ul>
            ) : (
              <ul className="space-y-0.5 max-h-40 overflow-auto">
                {lastResult.results?.map((r: any) => (
                  <li key={r.id} className={r.status === "ok" ? "text-emerald-700" : "text-red-700"}>
                    {r.status === "ok"
                      ? `✓ ${r.slug} (${r.words} words)`
                      : `✗ ${r.slug}: ${r.error}`}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 font-medium">Remaining templated pages: {lastResult.remaining}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
