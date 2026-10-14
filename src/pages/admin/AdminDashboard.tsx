import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, FileText, Sparkles, Eye, DollarSign,
  ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, ImageOff, FileWarning, Clock,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type RangeKey = "7d" | "30d" | "90d";
const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 };
const RANGE_LABEL: Record<RangeKey, string> = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" };

const daysAgoISO = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

const buildBuckets = (days: number) => {
  const now = new Date();
  const bucketCount = days <= 7 ? 7 : days <= 30 ? 30 : 12;
  const bucketDays = days / bucketCount;
  return Array.from({ length: bucketCount }, (_, i) => {
    const start = new Date(now.getTime() - (bucketCount - i) * bucketDays * 86400000);
    const end = new Date(now.getTime() - (bucketCount - i - 1) * bucketDays * 86400000);
    return {
      label: days <= 30
        ? start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    };
  });
};

const countAt = async (
  table: "analytics_events" | "newsletter_subscribers" | "ai_generations" | "content_pages",
  fromISO: string,
  toISO?: string,
  filter?: (q: any) => any,
) => {
  let q = supabase.from(table).select("*", { count: "exact", head: true }).gte("created_at", fromISO);
  if (toISO) q = q.lt("created_at", toISO);
  if (filter) q = filter(q);
  const { count } = await q;
  return count || 0;
};

const pctDelta = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export default function AdminDashboard() {
  const [range, setRange] = useState<RangeKey>("30d");
  const days = RANGE_DAYS[range];
  const currentFrom = useMemo(() => daysAgoISO(days), [days]);
  const previousFrom = useMemo(() => daysAgoISO(days * 2), [days]);
  const previousTo = currentFrom;

  // ---- Totals (all-time) ----
  const { data: pageStats, isLoading: pagesLoading } = useQuery({
    queryKey: ["admin-pages-stats"],
    queryFn: async () => {
      const [totalRes, publishedRes, topPagesRes] = await Promise.all([
        supabase.from("content_pages").select("id", { count: "exact", head: true }),
        supabase.from("content_pages").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("content_pages").select("id, title, slug, view_count").order("view_count", { ascending: false }).limit(10),
      ]);
      return {
        total: totalRes.count || 0,
        published: publishedRes.count || 0,
        topPages: topPagesRes.data || [],
      };
    },
    staleTime: 30_000,
  });

  const { data: totalAllViews = 0 } = useQuery({
    queryKey: ["admin-total-views-alltime"],
    queryFn: async () => {
      const { count } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "page_view")
        .eq("is_bot", false);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: subsAll = 0 } = useQuery({
    queryKey: ["admin-subs-alltime"],
    queryFn: async () => {
      const { count } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: aiAll = 0 } = useQuery({
    queryKey: ["admin-ai-alltime"],
    queryFn: async () => {
      const { count } = await supabase.from("ai_generations").select("*", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: affiliateClicks = 0 } = useQuery({
    queryKey: ["admin-affiliate-clicks", range],
    queryFn: async () => {
      const { count } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "affiliate_click")
        .gte("created_at", currentFrom);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: affiliateClicksPrev = 0 } = useQuery({
    queryKey: ["admin-affiliate-clicks-prev", range],
    queryFn: async () => {
      const { count } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "affiliate_click")
        .gte("created_at", previousFrom)
        .lt("created_at", previousTo);
      return count || 0;
    },
    staleTime: 30_000,
  });

  const { data: teamCount = 0 } = useQuery({
    queryKey: ["admin-team-count"],
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 30_000,
  });

  // ---- Period-bounded deltas ----
  const { data: deltas, isLoading: deltasLoading } = useQuery({
    queryKey: ["admin-deltas", range],
    queryFn: async () => {
      const [
        viewsCur, viewsPrev,
        subsCur, subsPrev,
        aiCur, aiPrev,
        pagesCur, pagesPrev,
      ] = await Promise.all([
        countAt("analytics_events", currentFrom, undefined, (q) => q.eq("event_type", "page_view").eq("is_bot", false)),
        countAt("analytics_events", previousFrom, previousTo, (q) => q.eq("event_type", "page_view").eq("is_bot", false)),
        countAt("newsletter_subscribers", currentFrom),
        countAt("newsletter_subscribers", previousFrom, previousTo),
        countAt("ai_generations", currentFrom),
        countAt("ai_generations", previousFrom, previousTo),
        countAt("content_pages", currentFrom, undefined, (q) => q.eq("is_published", true)),
        countAt("content_pages", previousFrom, previousTo, (q) => q.eq("is_published", true)),
      ]);
      return {
        views: { cur: viewsCur, prev: viewsPrev },
        subs: { cur: subsCur, prev: subsPrev },
        ai: { cur: aiCur, prev: aiPrev },
        pages: { cur: pagesCur, prev: pagesPrev },
      };
    },
    staleTime: 30_000,
  });

  // ---- Traffic chart for selected range ----
  const buckets = useMemo(() => buildBuckets(days), [days]);
  const { data: traffic = [], isLoading: trafficLoading } = useQuery({
    queryKey: ["admin-traffic", range],
    queryFn: async () => {
      const results = await Promise.all(
        buckets.map(async (b) => {
          const { count } = await supabase
            .from("analytics_events")
            .select("*", { count: "exact", head: true })
            .eq("event_type", "page_view")
            .eq("is_bot", false)
            .gte("created_at", b.startISO)
            .lt("created_at", b.endISO);
          return { label: b.label, views: count || 0 };
        }),
      );
      return results;
    },
    staleTime: 60_000,
  });

  // ---- Needs Attention ----
  const { data: attention, isLoading: attentionLoading } = useQuery({
    queryKey: ["admin-attention"],
    queryFn: async () => {
      const thirtyDaysAgo = daysAgoISO(30);
      const [staleDrafts, missingImage, missingMeta, zeroViews] = await Promise.all([
        supabase
          .from("content_pages")
          .select("id, title, slug, updated_at", { count: "exact" })
          .eq("is_published", false)
          .lt("updated_at", thirtyDaysAgo)
          .order("updated_at", { ascending: true })
          .limit(5),
        supabase
          .from("content_pages")
          .select("id, title, slug", { count: "exact", head: true })
          .eq("is_published", true)
          .is("featured_image_url", null),
        supabase
          .from("content_pages")
          .select("id, title, slug", { count: "exact", head: true })
          .eq("is_published", true)
          .is("meta_description", null),
        supabase
          .from("content_pages")
          .select("id, title, slug", { count: "exact", head: true })
          .eq("is_published", true)
          .eq("view_count", 0),
      ]);
      return {
        staleDraftsCount: staleDrafts.count || 0,
        staleDraftsSample: staleDrafts.data || [],
        missingImageCount: missingImage.count || 0,
        missingMetaCount: missingMeta.count || 0,
        zeroViewsCount: zeroViews.count || 0,
      };
    },
    staleTime: 60_000,
  });

  const totalPages = pageStats?.published || pageStats?.total || 0;
  const avgViews = totalPages > 0 ? Math.round(totalAllViews / totalPages) : 0;

  const Delta = ({ current, previous }: { current?: number; previous?: number }) => {
    if (current === undefined || previous === undefined) {
      return <Skeleton className="h-4 w-16 mt-1" />;
    }
    const pct = pctDelta(current, previous);
    const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
    const color = pct > 0 ? "text-emerald-600" : pct < 0 ? "text-red-600" : "text-muted-foreground";
    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${color} mt-1`}>
        <Icon className="h-3.5 w-3.5" />
        <span>{pct > 0 ? "+" : ""}{pct}%</span>
        <span className="text-muted-foreground font-normal">vs prev. {RANGE_LABEL[range].toLowerCase()}</span>
      </div>
    );
  };

  const StatCard = ({
    title, value, icon: Icon, description, loading, current, previous, periodValue,
  }: {
    title: string; value: number | string; icon: any; description: string; loading?: boolean;
    current?: number; previous?: number; periodValue?: number;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <CardTitle className="text-3xl">{typeof value === "number" ? value.toLocaleString() : value}</CardTitle>
        )}
        {current !== undefined && <Delta current={current} previous={previous} />}
        {periodValue !== undefined && !loading && (
          <p className="text-xs text-muted-foreground mt-0.5">
            +{periodValue.toLocaleString()} in {RANGE_LABEL[range].toLowerCase()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete overview of Visas.Guide performance</p>
        </div>
        <div className="inline-flex rounded-md border bg-card p-0.5">
          {(["7d", "30d", "90d"] as RangeKey[]).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={range === k ? "default" : "ghost"}
              className="h-8 px-3 text-xs"
              onClick={() => setRange(k)}
            >
              {k === "7d" ? "7d" : k === "30d" ? "30d" : "90d"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Published Pages"
          value={totalPages}
          icon={FileText}
          description={pageStats && pageStats.total !== pageStats.published
            ? `${pageStats.total.toLocaleString()} total (incl. drafts)`
            : "All content pages"}
          loading={pagesLoading}
          current={deltas?.pages.cur}
          previous={deltas?.pages.prev}
          periodValue={deltas?.pages.cur}
        />
        <StatCard
          title="Total Page Views"
          value={totalAllViews}
          icon={Eye}
          description={`Avg: ${avgViews.toLocaleString()} per page`}
          current={deltas?.views.cur}
          previous={deltas?.views.prev}
          periodValue={deltas?.views.cur}
        />
        <StatCard
          title="Newsletter Subscribers"
          value={subsAll}
          icon={Users}
          description="Active subscribers"
          current={deltas?.subs.cur}
          previous={deltas?.subs.prev}
          periodValue={deltas?.subs.cur}
        />
        <StatCard
          title="AI Content Generated"
          value={aiAll}
          icon={Sparkles}
          description="AI generations"
          current={deltas?.ai.cur}
          previous={deltas?.ai.prev}
          periodValue={deltas?.ai.cur}
        />
        <StatCard
          title="Affiliate Clicks"
          value={affiliateClicks}
          icon={DollarSign}
          description={`Tracked clicks in ${RANGE_LABEL[range].toLowerCase()}`}
          current={affiliateClicks}
          previous={affiliateClicksPrev}
        />
        <StatCard
          title="Team Members"
          value={teamCount}
          icon={Users}
          description="Admins & contributors with roles"
        />
      </div>

      {/* Needs Attention */}
      <Card className="mb-8 border-amber-200/60 bg-amber-50/30 dark:bg-amber-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Needs Attention</CardTitle>
          </div>
          <CardDescription>Action items to keep content quality and SEO healthy</CardDescription>
        </CardHeader>
        <CardContent>
          {attentionLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to="/admin/content?filter=drafts" className="group">
                <div className="rounded-lg border bg-card p-3 hover:border-amber-400 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Clock className="h-3.5 w-3.5" /> Stale drafts (30d+)
                  </div>
                  <div className="text-2xl font-bold">{attention?.staleDraftsCount.toLocaleString() ?? 0}</div>
                </div>
              </Link>
              <Link to="/admin/content?filter=missing-image" className="group">
                <div className="rounded-lg border bg-card p-3 hover:border-amber-400 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <ImageOff className="h-3.5 w-3.5" /> Missing featured image
                  </div>
                  <div className="text-2xl font-bold">{attention?.missingImageCount.toLocaleString() ?? 0}</div>
                </div>
              </Link>
              <Link to="/admin/content?filter=missing-meta" className="group">
                <div className="rounded-lg border bg-card p-3 hover:border-amber-400 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <FileWarning className="h-3.5 w-3.5" /> Missing meta description
                  </div>
                  <div className="text-2xl font-bold">{attention?.missingMetaCount.toLocaleString() ?? 0}</div>
                </div>
              </Link>
              <Link to="/admin/content?filter=zero-views" className="group">
                <div className="rounded-lg border bg-card p-3 hover:border-amber-400 transition-colors">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <Eye className="h-3.5 w-3.5" /> Published, 0 views
                  </div>
                  <div className="text-2xl font-bold">{attention?.zeroViewsCount.toLocaleString() ?? 0}</div>
                </div>
              </Link>
            </div>
          )}

          {attention && attention.staleDraftsSample.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Oldest stale drafts
              </p>
              <div className="space-y-1">
                {attention.staleDraftsSample.map((d) => (
                  <Link
                    key={d.id}
                    to={`/admin/content/${d.id}`}
                    className="flex items-center justify-between text-sm hover:bg-muted/50 rounded-sm px-2 py-1.5"
                  >
                    <span className="truncate flex-1">{d.title}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {new Date(d.updated_at).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Traffic — {RANGE_LABEL[range]}</CardTitle>
            <CardDescription>Page views over the selected range</CardDescription>
          </CardHeader>
          <CardContent>
            {trafficLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={traffic}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
            <CardDescription>Most viewed content (all-time)</CardDescription>
          </CardHeader>
          <CardContent>
            {pagesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (pageStats?.topPages.length ?? 0) === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pages yet</p>
            ) : (
              <div className="space-y-2">
                {pageStats?.topPages.slice(0, 6).map((page, index) => (
                  <div key={page.id} className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{page.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">/{page.slug}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm">{(page.view_count || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
