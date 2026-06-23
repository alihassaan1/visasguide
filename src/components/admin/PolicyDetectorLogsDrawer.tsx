import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollText, AlertCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

type Run = {
  id: string;
  run_at: string;
  trigger: string | null;
  scanned: number;
  detected: number;
  errors: number;
  duration_ms: number | null;
  error_message: string | null;
};

export function PolicyDetectorLogsDrawer() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["policy-detector-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policy_detector_runs")
        .select("*")
        .order("run_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Run[];
    },
    refetchInterval: 30_000,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <ScrollText className="h-4 w-4 mr-2" />
          Detector Logs
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Policy Detector Runs</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </SheetTitle>
          <SheetDescription>
            Last 50 cron and manual invocations. Cron runs every 2 hours.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {data?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No detector runs logged yet.
            </p>
          )}
          {data?.map((r) => (
            <div key={r.id} className="border rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {format(new Date(r.run_at), "MMM d, HH:mm:ss")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.run_at))} ago
                  </div>
                </div>
                <Badge variant={r.trigger === "cron" ? "secondary" : "outline"}>
                  {r.trigger ?? "manual"}
                </Badge>
              </div>
              <div className="flex gap-4 text-sm">
                <span>
                  <span className="text-muted-foreground">Scanned:</span>{" "}
                  <span className="font-medium tabular-nums">{r.scanned}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Detected:</span>{" "}
                  <span className="font-medium tabular-nums">{r.detected}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Errors:</span>{" "}
                  <span
                    className={`font-medium tabular-nums ${
                      r.errors > 0 ? "text-destructive" : ""
                    }`}
                  >
                    {r.errors}
                  </span>
                </span>
                {r.duration_ms != null && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {(r.duration_ms / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
              {r.error_message && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 rounded p-2">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="break-all">{r.error_message}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
