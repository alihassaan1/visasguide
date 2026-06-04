import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, MousePointerClick, Percent, Megaphone, ArrowUpDown, TrendingUp, CalendarIcon } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type SortKey = "clicks" | "impressions" | "ctr" | "priority";
type SortDir = "asc" | "desc";
type DateRange = "7d" | "30d" | "90d" | "all" | "custom";

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
];

export default function AdPerformanceDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [customStart, setCustomStart] = useState<Date | undefined>(subDays(new Date(), 14));
  const [customEnd, setCustomEnd] = useState<Date | undefined>(new Date());
  const [bannerSort, setBannerSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "clicks", dir: "desc" });

  const { startDate, endDate } = useMemo(() => {
    if (dateRange === "custom") {
      return {
        startDate: customStart ? startOfDay(customStart) : subDays(new Date(), 30),
        endDate: customEnd ? endOfDay(customEnd) : new Date(),
      };
    }
    if (dateRange === "all") return { startDate: new Date("2020-01-01"), endDate: new Date() };
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    return { startDate: subDays(new Date(), days), endDate: new Date() };
  }, [dateRange, customStart, customEnd]);

  // Fetch banner ads
  const { data: banners = [] } = useQuery({
    queryKey: ["ad-perf-banners"],
    queryFn: async () => {
      const { data } = await supabase.from("settings_affiliates").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Fetch affiliate widgets with location info
  const { data: widgets = [] } = useQuery({
    queryKey: ["ad-perf-widgets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("affiliate_widgets")
        .select("*, cities(name), countries(name)")
        .order("click_count", { ascending: false });
      return data || [];
    },
  });

  const { data: clickEvents = [] } = useQuery({
    queryKey: ["ad-perf-clicks", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("created_at, page_slug, search_term, visitor_location")
        .eq("event_type", "affiliate_click")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(5000);
      return data || [];
    },
  });

  const { data: impressionEvents = [] } = useQuery({
    queryKey: ["ad-perf-impressions", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics_events")
        .select("created_at, search_term, referrer_source")
        .eq("event_type", "banner_impression")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(10000);
      return data || [];
    },
  });

  const totalImpressions = banners.reduce((s, b) => s + (b.impressions || 0), 0);
  const totalBannerClicks = banners.reduce((s, b) => s + (b.click_count || 0), 0);
  const totalWidgetClicks = widgets.reduce((s, w) => s + (w.click_count || 0), 0);
  const totalClicks = totalBannerClicks + totalWidgetClicks;
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const activeAds = banners.filter((b) => b.is_active).length + widgets.filter((w) => w.is_active).length;

  const rangeImpressions = impressionEvents.length;
  const rangeClicks = clickEvents.length;
  const rangeCTR = rangeImpressions > 0 ? ((rangeClicks / rangeImpressions) * 100).toFixed(2) : "0.00";

  const dailyTrend = useMemo(() => {
    const map: Record<string, { impressions: number; clicks: number }> = {};
    impressionEvents.forEach((e) => {
      const day = format(new Date(e.created_at), "yyyy-MM-dd");
      map[day] = map[day] || { impressions: 0, clicks: 0 };
      map[day].impressions += 1;
    });
    clickEvents.forEach((e) => {
      const day = format(new Date(e.created_at), "yyyy-MM-dd");
      map[day] = map[day] || { impressions: 0, clicks: 0 };
      map[day].clicks += 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date: format(new Date(date), "MMM dd"),
        impressions: v.impressions,
        clicks: v.clicks,
        ctr: v.impressions > 0 ? Number(((v.clicks / v.impressions) * 100).toFixed(2)) : 0,
      }));
  }, [impressionEvents, clickEvents]);

  const bannerRangeBreakdown = useMemo(() => {
    const map: Record<string, { impressions: number; clicks: number }> = {};
    impressionEvents.forEach((e) => {
      const name = e.search_term || "(unknown)";
      map[name] = map[name] || { impressions: 0, clicks: 0 };
      map[name].impressions += 1;
    });
    clickEvents.forEach((e) => {
      const name = e.search_term || "(unknown)";
      map[name] = map[name] || { impressions: 0, clicks: 0 };
      map[name].clicks += 1;
    });
    return Object.entries(map)
      .map(([name, v]) => ({
        name,
        impressions: v.impressions,
        clicks: v.clicks,
        ctr: v.impressions > 0 ? ((v.clicks / v.impressions) * 100).toFixed(2) : "0.00",
      }))
      .sort((a, b) => b.impressions - a.impressions);
  }, [impressionEvents, clickEvents]);

  // Per-banner × per-slot breakdown (uses referrer_source for impressions,
  // visitor_location.position for clicks — both written by AffiliateBannerContainer).
  const slotBreakdown = useMemo(() => {
    const map: Record<string, { name: string; slot: string; impressions: number; clicks: number }> = {};
    const keyFor = (name: string, slot: string) => `${name}::${slot}`;

    impressionEvents.forEach((e: any) => {
      const name = e.search_term || "(unknown)";
      const slot = e.referrer_source || "(unspecified)";
      const k = keyFor(name, slot);
      map[k] = map[k] || { name, slot, impressions: 0, clicks: 0 };
      map[k].impressions += 1;
    });
    clickEvents.forEach((e: any) => {
      const name = e.search_term || "(unknown)";
      const slot =
        (e.visitor_location && typeof e.visitor_location === "object" && (e.visitor_location as any).position) ||
        "(unspecified)";
      const k = keyFor(name, slot);
      map[k] = map[k] || { name, slot, impressions: 0, clicks: 0 };
      map[k].clicks += 1;
    });

    return Object.values(map)
      .map((r) => ({
        ...r,
        ctr: r.impressions > 0 ? ((r.clicks / r.impressions) * 100).toFixed(2) : "0.00",
      }))
      .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);
  }, [impressionEvents, clickEvents]);

  // Banners with more than one assigned slot — flagged in the breakdown UI.
  const multiSlotBannerNames = useMemo(() => {
    const set = new Set<string>();
    banners.forEach((b: any) => {
      const slots = new Set<string>([...(b.positions || []), ...(b.position ? [b.position] : [])]);
      if (slots.size > 1) set.add(b.name);
    });
    return set;
  }, [banners]);

  const chartData = dailyTrend.map((d) => ({ date: d.date, clicks: d.clicks }));

  // Top pages
  const topPages = useMemo(() => {
    const map: Record<string, number> = {};
    clickEvents.forEach((e) => {
      if (e.page_slug) map[e.page_slug] = (map[e.page_slug] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([slug, clicks]) => ({ slug, clicks }));
  }, [clickEvents]);

  // Click source breakdown (website / newsletter / social)
  const sourceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    clickEvents.forEach((e: any) => {
      const src =
        (e.visitor_location && typeof e.visitor_location === "object" && (e.visitor_location as any).source) ||
        "website";
      map[src] = (map[src] || 0) + 1;
    });
    return Object.entries(map)
      .map(([source, clicks]) => ({
        source,
        clicks,
        share: clickEvents.length > 0 ? ((clicks / clickEvents.length) * 100).toFixed(1) : "0.0",
      }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [clickEvents]);

  // Per-banner × per-source breakdown
  const bannerSourceBreakdown = useMemo(() => {
    const map: Record<string, { name: string; source: string; clicks: number }> = {};
    clickEvents.forEach((e: any) => {
      const name = e.search_term || "(unknown)";
      const src =
        (e.visitor_location && typeof e.visitor_location === "object" && (e.visitor_location as any).source) ||
        "website";
      const k = `${name}::${src}`;
      map[k] = map[k] || { name, source: src, clicks: 0 };
      map[k].clicks += 1;
    });
    return Object.values(map).sort((a, b) => b.clicks - a.clicks);
  }, [clickEvents]);


  // Sorted banners
  const sortedBanners = useMemo(() => {
    return [...banners].sort((a, b) => {
      let aVal: number, bVal: number;
      if (bannerSort.key === "ctr") {
        aVal = (a.impressions || 0) > 0 ? (a.click_count || 0) / (a.impressions || 1) : 0;
        bVal = (b.impressions || 0) > 0 ? (b.click_count || 0) / (b.impressions || 1) : 0;
      } else if (bannerSort.key === "clicks") {
        aVal = a.click_count || 0;
        bVal = b.click_count || 0;
      } else if (bannerSort.key === "impressions") {
        aVal = a.impressions || 0;
        bVal = b.impressions || 0;
      } else {
        aVal = a.priority || 0;
        bVal = b.priority || 0;
      }
      return bannerSort.dir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [banners, bannerSort]);

  const toggleSort = (key: SortKey) => {
    setBannerSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }));
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(sortKey)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ad Performance</h1>
          <p className="text-muted-foreground">Track banner ads and affiliate widget performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border p-1 bg-muted/50">
            {dateRangeOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={dateRange === opt.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setDateRange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
            <Button
              variant={dateRange === "custom" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDateRange("custom")}
            >
              Custom
            </Button>
          </div>
          {dateRange === "custom" && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("justify-start font-normal", !customStart && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStart ? format(customStart, "MMM dd, yyyy") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customStart} onSelect={setCustomStart} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground text-sm">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("justify-start font-normal", !customEnd && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEnd ? format(customEnd, "MMM dd, yyyy") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={customEnd} onSelect={setCustomEnd} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Showing range: <span className="font-medium text-foreground">{format(startDate, "MMM dd, yyyy")}</span> → <span className="font-medium text-foreground">{format(endDate, "MMM dd, yyyy")}</span>
        {" · "}Range impressions: <span className="font-medium text-foreground">{rangeImpressions.toLocaleString()}</span>
        {" · "}Range clicks: <span className="font-medium text-foreground">{rangeClicks.toLocaleString()}</span>
        {" · "}Range CTR: <span className="font-medium text-foreground">{rangeCTR}%</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Eye className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><MousePointerClick className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Percent className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Overall CTR</p>
                <p className="text-2xl font-bold">{overallCTR}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Megaphone className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Active Ads</p>
                <p className="text-2xl font-bold">{activeAds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Day Banner Trends — for GA comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Banner Impressions & Clicks Per Day</CardTitle>
          <CardDescription>
            Per-day counts from analytics_events. Compare these to Google Analytics for the same date range.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Line type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="clicks" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-muted-foreground">No banner events for the selected period</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">Banner Ads ({banners.length})</TabsTrigger>
          <TabsTrigger value="sources">By Source</TabsTrigger>
          <TabsTrigger value="slots">By Slot</TabsTrigger>
          <TabsTrigger value="trends">Per-Day Trends</TabsTrigger>
          <TabsTrigger value="widgets">Affiliate Widgets ({widgets.length})</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="log">Click Log</TabsTrigger>
        </TabsList>

        {/* By Source breakdown */}
        <TabsContent value="sources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Clicks by Source</CardTitle>
                <CardDescription>
                  Where the click happened: your website, the email newsletter, or a social channel
                  (detected via UTM params and referrer).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sourceBreakdown.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sourceBreakdown.map((r) => (
                        <TableRow key={r.source}>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{r.source}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{r.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{r.share}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No click events for the selected period</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Per Banner × Source</CardTitle>
                <CardDescription>Which banners get clicks from which channel</CardDescription>
              </CardHeader>
              <CardContent>
                {bannerSourceBreakdown.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Banner</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bannerSourceBreakdown.map((r) => (
                        <TableRow key={`${r.name}-${r.source}`}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{r.source}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{r.clicks.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No click events for the selected period</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Per-banner × per-slot breakdown */}
        <TabsContent value="slots">
          <Card>
            <CardHeader>
              <CardTitle>Impressions & Clicks by Slot</CardTitle>
              <CardDescription>
                For banners assigned to multiple placements, this splits performance by slot
                (sidebar-right, horizontal-banner, in-content, footer). Based on analytics_events
                within the selected date range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banner</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slotBreakdown.map((row) => (
                    <TableRow key={`${row.name}-${row.slot}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.name}
                          {multiSlotBannerNames.has(row.name) && (
                            <Badge variant="outline" className="text-[10px]">multi-slot</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{row.slot}</Badge></TableCell>
                      <TableCell className="text-right">{row.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.ctr}%</TableCell>
                    </TableRow>
                  ))}
                  {slotBreakdown.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No banner events in this range
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banner Ads Table */}
        <TabsContent value="banners">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <SortHeader label="Impressions" sortKey="impressions" />
                    <SortHeader label="Clicks" sortKey="clicks" />
                    <SortHeader label="CTR" sortKey="ctr" />
                    <SortHeader label="Priority" sortKey="priority" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBanners.map((b) => {
                    const ctr = (b.impressions || 0) > 0 ? (((b.click_count || 0) / (b.impressions || 1)) * 100).toFixed(2) : "0.00";
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell><Badge variant="outline">{b.position}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={b.is_active ? "default" : "secondary"}>
                            {b.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{(b.impressions || 0).toLocaleString()}</TableCell>
                        <TableCell>{(b.click_count || 0).toLocaleString()}</TableCell>
                        <TableCell>{ctr}%</TableCell>
                        <TableCell>{b.priority || 0}</TableCell>
                      </TableRow>
                    );
                  })}
                  {banners.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No banners configured</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Per-Day Trends */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Breakdown</CardTitle>
                <CardDescription>Compare these numbers to GA's banner_impression / affiliate_click events</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyTrend.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...dailyTrend].reverse().map((d) => (
                        <TableRow key={d.date}>
                          <TableCell className="font-medium">{d.date}</TableCell>
                          <TableCell className="text-right">{d.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{d.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{d.ctr}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No events in this range</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Per-Banner (in range)</CardTitle>
                <CardDescription>Event-log impressions and clicks per banner for the selected dates</CardDescription>
              </CardHeader>
              <CardContent>
                {bannerRangeBreakdown.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Banner</TableHead>
                        <TableHead className="text-right">Impr.</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bannerRangeBreakdown.map((b) => (
                        <TableRow key={b.name}>
                          <TableCell className="font-medium">{b.name}</TableCell>
                          <TableCell className="text-right">{b.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{b.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{b.ctr}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No banner events in this range</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="widgets">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {widgets.map((w: any) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.affiliate_program}</TableCell>
                      <TableCell>{w.cities?.name || w.countries?.name || "Global"}</TableCell>
                      <TableCell><Badge variant="outline">{w.widget_variant || w.widget_type}</Badge></TableCell>
                      <TableCell>{(w.click_count || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={w.is_active ? "default" : "secondary"}>
                          {w.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {widgets.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No widgets configured</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Pages */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Pages generating the most affiliate clicks</CardDescription>
            </CardHeader>
            <CardContent>
              {topPages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPages.map((p) => (
                      <TableRow key={p.slug}>
                        <TableCell className="font-medium">{p.slug}</TableCell>
                        <TableCell className="text-right">{p.clicks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No page click data for the selected period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Click Activity Log */}
        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>Recent Click Activity</CardTitle>
              <CardDescription>Latest affiliate click events</CardDescription>
            </CardHeader>
            <CardContent>
              {clickEvents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Banner/Link</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clickEvents.slice(0, 50).map((e, i) => {
                      const src =
                        (e.visitor_location && typeof e.visitor_location === "object" && (e.visitor_location as any).source) ||
                        "website";
                      return (
                        <TableRow key={i}>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(e.created_at), "MMM dd, HH:mm")}
                          </TableCell>
                          <TableCell>{e.page_slug || "—"}</TableCell>
                          <TableCell>{e.search_term || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{src}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No click events for the selected period</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
