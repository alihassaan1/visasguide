import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, ShieldCheck, AlertTriangle, Wand2, Play, Activity, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type RunResult = {
  success: boolean;
  mode: "audit" | "fix";
  scanned: number;
  mismatched: number;
  fixed: number;
  byTruth: Record<string, number>;
  samples: { slug: string; truth: string; reason: string }[];
  nextOffset: number;
  exhausted: boolean;
};

function formatDuration(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return `${m}m ${rs}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export default function ContentValidator() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"audit" | "fix">("audit");
  const [batchSize, setBatchSize] = useState(500);
  const [offset, setOffset] = useState(0);
  const [autoContinue, setAutoContinue] = useState(false);
  const [totals, setTotals] = useState({ scanned: 0, mismatched: 0, fixed: 0 });
  const [byTruthAcc, setByTruthAcc] = useState<Record<string, number>>({});
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  const [log, setLog] = useState<string[]>([]);

  // Progress tracking
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loadingTotal, setLoadingTotal] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [lastBatchAt, setLastBatchAt] = useState<number | null>(null);
  const [pagesThisSession, setPagesThisSession] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [running]);

  async function loadTotal() {
    setLoadingTotal(true);
    try {
      const { count, error } = await supabase
        .from("content_pages")
        .select("id", { count: "exact", head: true })
        .or("slug.like.visa-requirements/%,slug.like.%-visa-requirements");
      if (error) throw error;
      setTotalPages(count ?? 0);
    } catch (e: any) {
      toast({ title: "Could not load total", description: e.message, variant: "destructive" });
    } finally {
      setLoadingTotal(false);
    }
  }

  useEffect(() => {
    loadTotal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const elapsedMs = startedAt ? now - startedAt : 0;
  const rate = elapsedMs > 0 && pagesThisSession > 0 ? pagesThisSession / (elapsedMs / 1000) : 0; // pages/sec
  const remaining = totalPages != null ? Math.max(totalPages - offset, 0) : 0;
  const etaMs = rate > 0 && totalPages != null ? (remaining / rate) * 1000 : NaN;
  const progressPct = totalPages && totalPages > 0 ? Math.min((offset / totalPages) * 100, 100) : 0;

  const appendLog = (line: string) =>
    setLog((l) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...l].slice(0, 200));

  async function runOnce(currentOffset: number): Promise<RunResult | null> {
    const { data, error } = await supabase.functions.invoke("content-validator", {
      body: { mode, batchSize, offset: currentOffset },
    });
    if (error) {
      toast({ title: "Validator error", description: error.message, variant: "destructive" });
      appendLog(`Error: ${error.message}`);
      return null;
    }
    return data as RunResult;
  }

  async function handleRun() {
    setRunning(true);
    setTotals({ scanned: 0, mismatched: 0, fixed: 0 });
    setByTruthAcc({});
    setLog([]);
    setPagesThisSession(0);
    const t0 = Date.now();
    setStartedAt(t0);
    setLastBatchAt(t0);
    let cursor = offset;
    try {
      while (true) {
        appendLog(`Running ${mode} at offset ${cursor} (batch ${batchSize})…`);
        const res = await runOnce(cursor);
        if (!res) break;
        setLastResult(res);
        setTotals((t) => ({
          scanned: t.scanned + res.scanned,
          mismatched: t.mismatched + res.mismatched,
          fixed: t.fixed + res.fixed,
        }));
        setByTruthAcc((acc) => {
          const next = { ...acc };
          for (const [k, v] of Object.entries(res.byTruth || {})) {
            next[k] = (next[k] || 0) + (v as number);
          }
          return next;
        });
        const processed = Math.max(res.nextOffset - cursor, 0);
        setPagesThisSession((p) => p + processed);
        setLastBatchAt(Date.now());
        appendLog(
          `Batch done — scanned ${res.scanned}, mismatched ${res.mismatched}${
            mode === "fix" ? `, fixed ${res.fixed}` : ""
          }`
        );
        cursor = res.nextOffset;
        setOffset(cursor);
        if (res.exhausted || !autoContinue) {
          if (res.exhausted) appendLog("Reached end of dataset.");
          break;
        }
      }
      toast({
        title: mode === "audit" ? "Audit complete" : "Fix run complete",
        description: `Cursor at offset ${cursor.toLocaleString()}.`,
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> Content Validator
        </h1>
        <p className="text-muted-foreground mt-1">
          Audits visa-requirements pages whose article body contradicts the canonical
          <code className="mx-1">visa_requirements</code> truth table (e.g. a visa-free pair that
          tells users they need a visa). Run in <strong>Audit</strong> mode first, then switch to
          <strong> Fix</strong> to overwrite the mismatched articles with correct, deterministic
          content.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run a batch</CardTitle>
          <CardDescription>
            Each batch processes up to {batchSize} pages starting from the cursor offset.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Mode</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant={mode === "audit" ? "default" : "outline"}
                  onClick={() => setMode("audit")}
                  disabled={running}
                >
                  Audit
                </Button>
                <Button
                  size="sm"
                  variant={mode === "fix" ? "default" : "outline"}
                  onClick={() => setMode("fix")}
                  disabled={running}
                >
                  <Wand2 className="h-3.5 w-3.5 mr-1" /> Fix
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="batch">Batch size</Label>
              <Input
                id="batch"
                type="number"
                value={batchSize}
                min={50}
                max={2000}
                onChange={(e) => setBatchSize(Number(e.target.value) || 500)}
                disabled={running}
              />
            </div>
            <div>
              <Label htmlFor="offset">Cursor offset</Label>
              <Input
                id="offset"
                type="number"
                value={offset}
                min={0}
                onChange={(e) => setOffset(Number(e.target.value) || 0)}
                disabled={running}
              />
            </div>
            <div>
              <Label>Auto-continue</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="auto"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={autoContinue}
                  onChange={(e) => setAutoContinue(e.target.checked)}
                  disabled={running}
                />
                <label htmlFor="auto" className="text-sm text-muted-foreground">
                  Loop through all pages
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRun} disabled={running}>
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" /> Run {mode}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setOffset(0);
                setTotals({ scanned: 0, mismatched: 0, fixed: 0 });
                setByTruthAcc({});
                setLastResult(null);
                setLog([]);
              }}
              disabled={running}
            >
              Reset cursor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className={`h-5 w-5 ${running ? "text-green-600 animate-pulse" : "text-muted-foreground"}`} />
                Live progress
              </CardTitle>
              <CardDescription>
                Tracks the cursor against the total visa-requirements page set.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadTotal} disabled={loadingTotal}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingTotal ? "animate-spin" : ""}`} />
              Refresh total
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {offset.toLocaleString()} / {totalPages != null ? totalPages.toLocaleString() : "—"} pages
              </span>
              <span className="font-medium">{progressPct.toFixed(1)}%</span>
            </div>
            <Progress value={progressPct} className="h-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-xs">Cursor offset</div>
              <div className="text-lg font-semibold">{offset.toLocaleString()}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-xs">Processed this session</div>
              <div className="text-lg font-semibold">{pagesThisSession.toLocaleString()}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-xs">Throughput</div>
              <div className="text-lg font-semibold">
                {rate > 0 ? `${rate.toFixed(1)} pg/s` : "—"}
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-xs">Est. time remaining</div>
              <div className="text-lg font-semibold">{formatDuration(etaMs)}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-xs">Elapsed</div>
              <div className="text-lg font-semibold">{startedAt ? formatDuration(elapsedMs) : "—"}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-xs">Remaining pages</div>
              <div className="text-lg font-semibold">
                {totalPages != null ? remaining.toLocaleString() : "—"}
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-xs">Last batch</div>
              <div className="text-lg font-semibold">
                {lastBatchAt ? `${Math.round((now - lastBatchAt) / 1000)}s ago` : "—"}
              </div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground text-xs">Status</div>
              <div className="text-lg font-semibold">
                {running ? (autoContinue ? "Looping" : "Running") : "Idle"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scanned (this session)</CardDescription>
            <CardTitle className="text-3xl">{totals.scanned.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mismatched</CardDescription>
            <CardTitle className="text-3xl text-yellow-600 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" /> {totals.mismatched.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fixed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{totals.fixed.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {Object.keys(byTruthAcc).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mismatches by truth type</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(byTruthAcc).map(([k, v]) => (
              <Badge key={k} variant="secondary" className="text-sm">
                {k}: {v.toLocaleString()}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {lastResult && lastResult.samples?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Latest sample mismatches</CardTitle>
            <CardDescription>From the most recent batch.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastResult.samples.map((s) => (
                <div
                  key={s.slug}
                  className="flex items-start justify-between gap-3 border rounded-md p-3"
                >
                  <div>
                    <a
                      href={`/${s.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      /{s.slug}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                  </div>
                  <Badge variant="outline">{s.truth}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {log.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Run log</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 rounded border p-3 bg-muted/30">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap">{log.join("\n")}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
