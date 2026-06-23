import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

type Feed = {
  id: string;
  name: string;
  url: string;
  category: string | null;
  is_active: boolean;
  last_fetched: string | null;
  last_error: string | null;
  articles_fetched: number | null;
  fetch_interval_minutes: number | null;
};

type FeedHealth = Feed & {
  queueTotal: number;
  queuePending: number;
  lastSuccessfulParse: string | null;
};

async function loadHealth(): Promise<FeedHealth[]> {
  const { data: feeds, error } = await supabase
    .from("rss_feeds")
    .select("*")
    .order("name");
  if (error) throw error;

  const enriched = await Promise.all(
    (feeds || []).map(async (f: Feed) => {
      const [{ count: total }, { count: pending }, { data: lastOk }] = await Promise.all([
        supabase
          .from("rss_article_queue")
          .select("*", { count: "exact", head: true })
          .eq("rss_feed_id", f.id),
        supabase
          .from("rss_article_queue")
          .select("*", { count: "exact", head: true })
          .eq("rss_feed_id", f.id)
          .eq("status", "pending"),
        supabase
          .from("rss_article_queue")
          .select("processed_at")
          .eq("rss_feed_id", f.id)
          .in("status", ["processed", "approved", "published"])
          .order("processed_at", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return {
        ...f,
        queueTotal: total ?? 0,
        queuePending: pending ?? 0,
        lastSuccessfulParse: lastOk?.processed_at ?? null,
      };
    }),
  );
  return enriched;
}

const fmt = (d: string | null) =>
  d ? `${formatDistanceToNow(new Date(d))} ago` : "—";

export default function RSSFeedsHealth() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["rss-feeds-health"],
    queryFn: loadHealth,
    refetchInterval: 60_000,
  });

  const active = data?.filter((f) => f.is_active).length ?? 0;
  const erroring = data?.filter((f) => f.last_error).length ?? 0;
  const pending = data?.reduce((a, f) => a + f.queuePending, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">RSS Feeds Health</h1>
          <p className="text-muted-foreground text-sm">
            Per-feed fetch, parse and queue status. Auto-refreshes every minute.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" /> Active feeds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{active}</div>
            <p className="text-xs text-muted-foreground">of {data?.length ?? 0} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Feeds with errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{erroring}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Pending queue items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last fetch</TableHead>
                    <TableHead>Last successful parse</TableHead>
                    <TableHead className="text-right">Queue (pending / total)</TableHead>
                    <TableHead>Last error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs">{f.url}</div>
                        {f.category && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {f.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {f.is_active ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Paused</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{fmt(f.last_fetched)}</TableCell>
                      <TableCell className="text-sm">{fmt(f.lastSuccessfulParse)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className="font-medium">{f.queuePending}</span>
                        <span className="text-muted-foreground"> / {f.queueTotal}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {f.last_error ? (
                          <span className="text-xs text-destructive line-clamp-2">{f.last_error}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No RSS feeds configured.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
