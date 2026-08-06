import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAllRows";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { TrendingUp, Users, Search, Globe, Eye, Clock, MousePointer, MousePointerClick, FileText, MapPin, Monitor, ExternalLink, Smartphone, Tablet, Laptop, Bot, Mail, Link2, MailOpen } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { format, subDays, subHours, startOfDay, endOfDay, subYears } from "date-fns";

type TimePeriod = '24h' | 'yesterday' | '7d' | '14d' | '30d' | '60d' | '90d' | '1y' | 'all';

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: '24h', label: '24 Hours' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '14 Days' },
  { value: '30d', label: '30 Days' },
  { value: '60d', label: '60 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

const getDateRange = (period: TimePeriod) => {
  const now = new Date();
  switch (period) {
    case '24h':
      return { start: subHours(now, 24), end: now, isHourly: true };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday), isHourly: true };
    case '7d':
      return { start: subDays(now, 7), end: now, isHourly: false };
    case '14d':
      return { start: subDays(now, 14), end: now, isHourly: false };
    case '30d':
      return { start: subDays(now, 30), end: now, isHourly: false };
    case '60d':
      return { start: subDays(now, 60), end: now, isHourly: false };
    case '90d':
      return { start: subDays(now, 90), end: now, isHourly: false };
    case '1y':
      return { start: subYears(now, 1), end: now, isHourly: false };
    case 'all':
      // Since October 29, 2025 (when analytics was added)
      return { start: new Date('2025-10-29'), end: now, isHourly: false };
    default:
      return { start: subDays(now, 14), end: now, isHourly: false };
  }
};

const AnalyticsDashboard = () => {
  const [trendPeriod, setTrendPeriod] = useState<TimePeriod>('30d');

  // Get date range based on selected period
  const { start: periodStart, end: periodEnd } = getDateRange(trendPeriod);
  const periodLabel = TIME_PERIODS.find(p => p.value === trendPeriod)?.label || '30 Days';

  // Fetch analytics summary using server-side aggregation (no 1000-row limit)
  const { data: analyticsSummary } = useQuery({
    queryKey: ['analytics-summary', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_summary', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString()
      });
      
      if (error) throw error;
      
      const result = data as any;
      const total = Number(result.total) || 0;
      const botTraffic = Number(result.botTraffic) || 0;

      return {
        pageViews: Number(result.humanPageViews ?? result.pageViews) || 0,
        allPageViews: Number(result.pageViews) || 0,
        botPageViews: Number(result.botPageViews) || 0,
        searches: Number(result.searches) || 0,
        searchEngineReferrals: Number(result.searchEngineReferrals) || 0,
        total,
        avgSessionDuration: Number(result.avgSessionDuration) || 0,
        uniqueVisitors: Number(result.humanUniqueVisitors ?? result.uniqueVisitors) || 0,
        botUniqueVisitors: Number(result.botUniqueVisitors) || 0,
        newsletterSignups: Number(result.newsletterSignups) || 0,
        bannerImpressions: Number(result.bannerImpressions) || 0,
        affiliateClicks: Number(result.affiliateClicks) || 0,
        botTraffic,
        botPercentage: total > 0 ? Math.round((botTraffic / total) * 100) : 0
      };
    }
  });

  // Traffic trend using server-side aggregation
  const { data: dailyTrend } = useQuery({
    queryKey: ['daily-traffic-trend', trendPeriod],
    queryFn: async () => {
      const { start, end, isHourly } = getDateRange(trendPeriod);
      const granularity = isHourly ? 'hourly' : (trendPeriod === '1y' || trendPeriod === 'all') ? 'monthly' : 'daily';
      
      const { data, error } = await supabase.rpc('get_traffic_trend', {
        p_start: start.toISOString(),
        p_end: end.toISOString(),
        p_granularity: granularity
      });
      
      if (error) throw error;
      
      return ((data as any[]) || []).map((item: any) => ({
        date: item.period,
        pageViews: Number(item.pageViews) || 0,
        searches: Number(item.searches) || 0
      }));
    }
  });

  // Recent visitors (last 10)
  const { data: recentVisitors } = useQuery({
    queryKey: ['recent-visitors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at, page_slug, device_type, device_name, browser_name, visitor_location, is_bot')
        .eq('event_type', 'page_view')
        .eq('is_bot', false)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  // Device type distribution using server-side aggregation
  const { data: deviceDistribution } = useQuery({
    queryKey: ['device-distribution', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_distribution', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
        p_field: 'device_type'
      });
      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // Browser distribution using server-side aggregation
  const { data: browserDistribution } = useQuery({
    queryKey: ['browser-distribution', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_distribution', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
        p_field: 'browser_name'
      });
      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // OS distribution using server-side aggregation
  const { data: osDistribution } = useQuery({
    queryKey: ['os-distribution', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_distribution', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
        p_field: 'os_name'
      });
      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // Screen resolutions using server-side aggregation
  const { data: screenResolutions } = useQuery({
    queryKey: ['screen-resolutions', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_distribution', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
        p_field: 'screen_resolution'
      });
      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // Top device names using server-side aggregation
  const { data: topDevices } = useQuery({
    queryKey: ['top-devices', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_distribution', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
        p_field: 'device_name'
      });
      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // Enhanced Newsletter stats with email opens (uses head counts — no 1000-row limit)
  const { data: newsletterStats } = useQuery({
    queryKey: ['newsletter-stats-enhanced'],
    queryFn: async () => {
      const { count: totalSubscribers } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: signups30d } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { count: views } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .eq('is_bot', false)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(10);

      const { count: totalOpens } = await supabase
        .from('email_opens')
        .select('*', { count: 'exact', head: true })
        .gte('opened_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const subs = totalSubscribers || 0;
      const signups = signups30d || 0;
      const viewsCount = views || 1;
      const rate = ((signups / viewsCount) * 100).toFixed(2);

      const totalSent = campaigns?.reduce((acc, c) => acc + (c.sent_count || 0), 0) || 0;
      const opensCount = totalOpens || 0;
      const openRate = totalSent > 0 ? ((opensCount / totalSent) * 100).toFixed(1) : '0';

      return {
        totalSubscribers: subs,
        signups,
        rate,
        totalSent,
        totalOpens: opensCount,
        openRate,
        campaigns: campaigns || []
      };
    }
  });

  // Affiliate click stats using server-side aggregation
  const { data: affiliateStats } = useQuery({
    queryKey: ['affiliate-stats', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_distribution', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
        p_field: 'affiliate_clicks'
      });
      if (error) throw error;
      const items = (data as any[]) || [];
      const totalClicks = items.reduce((acc: number, item: any) => acc + (Number(item.clicks) || 0), 0);
      return { totalClicks, topAffiliates: items.slice(0, 5) };
    }
  });

  // Bot traffic details using detailed classification (search engines, AI crawlers, SEO tools, social)
  const { data: botTrafficDetails } = useQuery({
    queryKey: ['bot-traffic-breakdown', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_bot_traffic_breakdown', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
      });
      if (error) throw error;
      return (data as Array<{ name: string; category: string; hits: number; unique_ips: number; last_seen: string }>) || [];
    }
  });






  // Traffic sources using server-side aggregation
  const { data: trafficSources } = useQuery({
    queryKey: ['traffic-sources', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_distribution', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
        p_field: 'referrer_source'
      });
      if (error) throw error;
      return ((data as any[]) || []).map((item: any) => ({
        name: getSourceDisplayName(normalizeSource(item.name || 'direct')),
        originalName: item.name,
        value: Number(item.value) || 0
      }));
    }
  });

  // Enhanced Referring URLs with full URL and source detection - USES SELECTED PERIOD
  const { data: referringUrls } = useQuery({
    queryKey: ['referring-urls-enhanced', trendPeriod],
    queryFn: async () => {
      const data = await fetchAllRows<{ referrer_source: string | null }>((from, to) =>
        supabase
          .from('analytics_events')
          .select('referrer_source')
          .not('referrer_source', 'is', null)
          .not('referrer_source', 'eq', 'direct')
          .gte('created_at', periodStart.toISOString())
          .lte('created_at', periodEnd.toISOString())
          .range(from, to)
      );
      
      const urlCounts: Record<string, { url: string, count: number, source: string }> = {};
      data.forEach(item => {
        const url = item.referrer_source || '';
        if (!urlCounts[url]) {
          urlCounts[url] = { url, count: 0, source: detectSource(url) };
        }
        urlCounts[url].count++;
      });
      
      return Object.values(urlCounts).sort((a, b) => b.count - a.count).slice(0, 20);
    }
  });

  // Search engine keywords
  const { data: searchEngineQueries } = useQuery({
    queryKey: ['search-engine-queries', trendPeriod],
    queryFn: async () => {
      const data = await fetchAllRows<{ search_engine_query: string | null; referrer_source: string | null }>((from, to) =>
        supabase
          .from('analytics_events')
          .select('search_engine_query, referrer_source')
          .not('search_engine_query', 'is', null)
          .gte('created_at', periodStart.toISOString())
          .lte('created_at', periodEnd.toISOString())
          .order('created_at', { ascending: false })
          .range(from, to)
      );
      
      const queryCounts: Record<string, { query: string, searchEngine: string, count: number }> = {};
      data.forEach(item => {
        const key = `${item.search_engine_query}_${item.referrer_source}`;
        if (!queryCounts[key]) {
          queryCounts[key] = { query: item.search_engine_query!, searchEngine: getSearchEngineName(item.referrer_source), count: 0 };
        }
        queryCounts[key].count++;
      });
      
      return Object.values(queryCounts).sort((a, b) => b.count - a.count).slice(0, 15);
    }
  });

  // Top pages using server-side aggregation
  const { data: topPages } = useQuery({
    queryKey: ['top-pages', trendPeriod],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_distribution', {
        p_start: periodStart.toISOString(),
        p_end: periodEnd.toISOString(),
        p_field: 'top_pages'
      });
      if (error) throw error;
      return ((data as any[]) || []).map((item: any) => ({
        page: item.slug || '/',
        views: Number(item.views) || 0
      }));
    }
  });

  // Visitor locations - USES SELECTED PERIOD
  const { data: visitorLocations } = useQuery({
    queryKey: ['visitor-locations', trendPeriod],
    queryFn: async () => {
      const data = await fetchAllRows<{ visitor_location: any }>((from, to) =>
        supabase
          .from('analytics_events')
          .select('visitor_location')
          .not('visitor_location', 'is', null)
          .gte('created_at', periodStart.toISOString())
          .lte('created_at', periodEnd.toISOString())
          .range(from, to)
      );
      
      const locationCounts: Record<string, number> = {};
      data.forEach(item => {
        const location = item.visitor_location as { country?: string } | null;
        const country = location?.country || 'Unknown';
        locationCounts[country] = (locationCounts[country] || 0) + 1;
      });
      
      return Object.entries(locationCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
  });

  // Page performance - USES SELECTED PERIOD
  const { data: pagePerformance } = useQuery({
    queryKey: ['page-performance', trendPeriod],
    queryFn: async () => {
      const data = await fetchAllRows<{ session_duration_seconds: number | null; page_slug: string | null; event_type: string | null }>((from, to) =>
        supabase
          .from('analytics_events')
          .select('session_duration_seconds, page_slug, event_type')
          .gte('created_at', periodStart.toISOString())
          .lte('created_at', periodEnd.toISOString())
          .range(from, to)
      );
      
      const sessionsWithDuration = data.filter(e => e.session_duration_seconds && e.session_duration_seconds > 0);
      const avgTimeOnPage = sessionsWithDuration.length > 0 
        ? Math.round(sessionsWithDuration.reduce((acc, e) => acc + (e.session_duration_seconds || 0), 0) / sessionsWithDuration.length)
        : 0;
      
      const totalPageViews = data.filter(e => e.event_type === 'page_view').length;
      const singlePageSessions = data.filter(e => e.session_duration_seconds && e.session_duration_seconds < 10).length;
      const bounceRate = totalPageViews > 0 ? Math.round((singlePageSessions / totalPageViews) * 100) : 0;
      const pagesPerSession = sessionsWithDuration.length > 0 
        ? (totalPageViews / Math.max(sessionsWithDuration.length, 1)).toFixed(1)
        : '0';
      
      return { avgTimeOnPage, bounceRate, pagesPerSession };
    }
  });

  // Top visa searches
  const { data: topSearches } = useQuery({
    queryKey: ['top-searches', trendPeriod],
    queryFn: async () => {
      const data = await fetchAllRows<any>((from, to) =>
        supabase
          .from('analytics_events')
          .select(`
            from_country_id,
            to_country_id,
            from_country:countries!analytics_events_from_country_id_fkey(name, code, flag_emoji),
            to_country:countries!analytics_events_to_country_id_fkey(name, code, flag_emoji)
          `)
          .eq('event_type', 'search')
          .gte('created_at', periodStart.toISOString())
          .lte('created_at', periodEnd.toISOString())
          .range(from, to)
      );
      
      const searchCounts: Record<string, { from: any, to: any, count: number }> = {};
      data.forEach(item => {
        const key = `${item.from_country_id}-${item.to_country_id}`;
        if (!searchCounts[key]) {
          searchCounts[key] = { from: item.from_country, to: item.to_country, count: 0 };
        }
        searchCounts[key].count++;
      });
      
      return Object.values(searchCounts).sort((a, b) => b.count - a.count).slice(0, 10);
    }
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];
  const DEVICE_COLORS = { desktop: '#3b82f6', mobile: '#22c55e', tablet: '#f59e0b', unknown: '#6b7280' };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Laptop className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Comprehensive visitor behavior and site performance tracking</p>
      </div>

      {/* Traffic Trend - TOP with time period buttons */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Traffic Trend
            </CardTitle>
            <div className="flex flex-wrap gap-1">
              {TIME_PERIODS.map(period => (
                <Button
                  key={period.value}
                  variant={trendPeriod === period.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTrendPeriod(period.value)}
                  className="text-xs px-2 py-1 h-7"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-w-0">
          <div style={{ width: '100%', height: 280 }} key={`chart-${trendPeriod}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="pageViews" stroke="hsl(var(--primary))" strokeWidth={2} name="Page Views" />
                <Line type="monotone" dataKey="searches" stroke="hsl(var(--secondary))" strokeWidth={2} name="Searches" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards — human traffic only (bots reported separately below) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{analyticsSummary?.pageViews.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Humans · {periodLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{analyticsSummary?.uniqueVisitors.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Humans, by IP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Visa Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{analyticsSummary?.searches.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatDuration(analyticsSummary?.avgSessionDuration || 0)}</div>
            <p className="text-xs text-muted-foreground">Time on site</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Newsletter Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{analyticsSummary?.newsletterSignups.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Banner Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{analyticsSummary?.affiliateClicks.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsSummary?.bannerImpressions.toLocaleString() || 0} impressions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bot / crawler traffic — kept out of the human numbers above */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            Bot &amp; Crawler Traffic
            <Badge variant="outline" className="ml-2 text-xs">Excluded from stats above</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Bot Page Views</p>
              <p className="text-xl font-bold">{analyticsSummary?.botPageViews.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bot Events (all)</p>
              <p className="text-xl font-bold">{analyticsSummary?.botTraffic.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique Bot IPs</p>
              <p className="text-xl font-bold">{analyticsSummary?.botUniqueVisitors.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Share of All Traffic</p>
              <p className="text-xl font-bold">{analyticsSummary?.botPercentage || 0}%</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Search-engine and AI crawlers are good for indexing — this is monitoring, not a problem.
            Detailed per-bot breakdown is further down the page.
          </p>
        </CardContent>
      </Card>


      {/* Recent Visitors - Real-time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Recent Visitors
            <Badge variant="outline" className="ml-2 text-xs">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Time</TableHead>
                <TableHead className="text-xs">Page</TableHead>
                <TableHead className="text-xs">Device</TableHead>
                <TableHead className="text-xs">Browser</TableHead>
                <TableHead className="text-xs">Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentVisitors?.map((visitor, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(visitor.created_at), 'HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-xs font-mono truncate max-w-[150px]">{visitor.page_slug || '/'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      {getDeviceIcon(visitor.device_type || 'desktop')}
                      <span className="truncate max-w-[80px]">{visitor.device_name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{visitor.browser_name || '-'}</TableCell>
                  <TableCell className="text-xs">
                    {(visitor.visitor_location as any)?.country || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Device/Browser/OS Analytics - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div style={{ width: '100%', height: 200 }} key={`device-${trendPeriod}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {(deviceDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[entry.name as keyof typeof DEVICE_COLORS] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Browser Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" />
              Browsers
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div style={{ width: '100%', height: 200 }} key={`browser-${trendPeriod}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserDistribution || []} layout="vertical">
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={60} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* OS Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5" />
              Operating Systems
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div style={{ width: '100%', height: 200 }} key={`os-${trendPeriod}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {(osDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screen Resolutions & Device Names - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Screen Resolutions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5" />
              Screen Resolutions
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Resolution</TableHead>
                  <TableHead className="text-right text-xs">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screenResolutions?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs font-mono">{item.resolution}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.count}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!screenResolutions || screenResolutions.length === 0) && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4 text-sm">No data yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Device Names */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5" />
              Top Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-right text-xs">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDevices?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getDeviceIcon(item.type)}
                        <span className="text-xs capitalize">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.count}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!topDevices || topDevices.length === 0) && (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4 text-sm">No data yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter & Affiliate Stats - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Enhanced Newsletter Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Newsletter Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 border rounded-lg bg-muted/30">
                <div className="text-xs text-muted-foreground">Subscribers</div>
                <div className="text-xl font-bold">{newsletterStats?.totalSubscribers || 0}</div>
              </div>
              <div className="p-3 border rounded-lg bg-muted/30">
                <div className="text-xs text-muted-foreground">Sent (30d)</div>
                <div className="text-xl font-bold">{newsletterStats?.totalSent || 0}</div>
              </div>
              <div className="p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MailOpen className="h-3 w-3" />
                  Opens (30d)
                </div>
                <div className="text-xl font-bold">{newsletterStats?.totalOpens || 0}</div>
              </div>
              <div className="p-3 border rounded-lg bg-muted/30">
                <div className="text-xs text-muted-foreground">Open Rate</div>
                <div className="text-xl font-bold">{newsletterStats?.openRate || 0}%</div>
              </div>
            </div>
            
            {newsletterStats?.campaigns && newsletterStats.campaigns.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground mb-2">Recent Campaigns</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Subject</TableHead>
                      <TableHead className="text-xs text-center">Sent</TableHead>
                      <TableHead className="text-xs text-center">Opens</TableHead>
                      <TableHead className="text-xs text-right">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletterStats.campaigns.slice(0, 5).map((campaign: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs truncate max-w-[150px]">{campaign.subject}</TableCell>
                        <TableCell className="text-xs text-center">{campaign.sent_count || 0}</TableCell>
                        <TableCell className="text-xs text-center">{campaign.opened_count || 0}</TableCell>
                        <TableCell className="text-xs text-right">
                          {campaign.sent_count > 0 ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* Affiliate Clicks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="h-5 w-5" />
              Affiliate Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 border rounded-lg bg-muted/30 mb-3">
              <div className="text-xs text-muted-foreground">Total Clicks (30d)</div>
              <div className="text-2xl font-bold">{affiliateStats?.totalClicks || 0}</div>
            </div>
            <div className="space-y-2">
              {affiliateStats?.topAffiliates.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  <Badge variant="secondary">{item.clicks}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bot & Crawler Traffic — grouped by category with totals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            Bot & Crawler Traffic by Source
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Grouped by category. AI crawlers (GPTBot, ClaudeBot, Perplexity, Gemini) drive AI citations; search engines drive organic. Ranked by hits.
          </p>
        </CardHeader>
        <CardContent>
          {(!botTrafficDetails || botTrafficDetails.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">No bot traffic detected in this period</p>
          ) : (
            <>
              {/* Category totals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {(() => {
                  const totals: Record<string, number> = {};
                  botTrafficDetails.forEach((b) => {
                    totals[b.category] = (totals[b.category] || 0) + Number(b.hits);
                  });
                  const order = ['Search engine', 'AI crawler', 'SEO tool', 'Social / Messaging', 'Other'];
                  return order
                    .filter((c) => totals[c])
                    .map((c) => (
                      <div key={c} className="p-3 border rounded-lg">
                        <div className="text-xs text-muted-foreground">{c}</div>
                        <div className="text-lg font-bold">{totals[c].toLocaleString()}</div>
                      </div>
                    ));
                })()}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bot / Crawler</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Hits</TableHead>
                    <TableHead className="text-right">Unique IPs</TableHead>
                    <TableHead className="text-right">Last seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {botTrafficDetails.map((b, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          b.category === 'AI crawler' ? 'default' :
                          b.category === 'Search engine' ? 'secondary' :
                          'outline'
                        }>{b.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{Number(b.hits).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{Number(b.unique_ips).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {b.last_seen ? format(new Date(b.last_seen), 'MMM d, HH:mm') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>






      {/* Page Performance & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficSources?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Page Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5" />
              Page Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Avg. Time on Page</span>
                </div>
                <div className="text-2xl font-bold">{formatDuration(pagePerformance?.avgTimeOnPage || 0)}</div>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MousePointer className="h-4 w-4" />
                  <span className="text-xs">Bounce Rate</span>
                </div>
                <div className="text-2xl font-bold">{pagePerformance?.bounceRate || 0}%</div>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Pages per Session</span>
                </div>
                <div className="text-2xl font-bold">{pagePerformance?.pagesPerSession || '0'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Page</TableHead>
                  <TableHead className="text-right text-xs">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs font-mono truncate max-w-[200px]">{item.page || '/'}</TableCell>
                    <TableCell className="text-right"><Badge variant="secondary">{item.views}</Badge></TableCell>
                  </TableRow>
                ))}
                {(!topPages || topPages.length === 0) && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Visitor Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Country</TableHead>
                  <TableHead className="text-right text-xs">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitorLocations?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs font-medium">{item.country}</TableCell>
                    <TableCell className="text-right"><Badge variant="secondary">{item.count}</Badge></TableCell>
                  </TableRow>
                ))}
                {(!visitorLocations || visitorLocations.length === 0) && (
                  <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-4">No data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Search Engine Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Engine Keywords</CardTitle>
          <p className="text-xs text-muted-foreground">Keywords with search engine identification</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Keyword</TableHead>
                <TableHead className="text-xs">Search Engine</TableHead>
                <TableHead className="text-right text-xs">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchEngineQueries?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-xs">{item.query}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${getSearchEngineBadgeClass(item.searchEngine)}`}>
                      {item.searchEngine}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right"><Badge>{item.count}</Badge></TableCell>
                </TableRow>
              ))}
              {(!searchEngineQueries || searchEngineQueries.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4 text-sm">
                    No search engine keywords captured yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Enhanced Referring URLs with Full URL and Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ExternalLink className="h-5 w-5" />
            Top Referring URLs
          </CardTitle>
          <p className="text-xs text-muted-foreground">Full referrer URLs with source identification</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Full Referring URL</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-right text-xs">Visits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referringUrls?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="max-w-[400px]">
                    {item.url.startsWith('http') ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs break-all line-clamp-2">
                        {item.url}
                      </a>
                    ) : (
                      <span className="text-xs break-all">{item.url}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${getSourceBadgeClass(item.source)}`}>
                      {item.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right"><Badge>{item.count}</Badge></TableCell>
                </TableRow>
              ))}
              {(!referringUrls || referringUrls.length === 0) && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">No referrers</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Visa Searches - BOTTOM */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Top Visa Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From Country</TableHead>
                <TableHead>To Country</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSearches?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                        {item.from?.flag_emoji || countryCodeToFlagEmoji(item.from?.code) || '🏳️'}
                      </span>
                      <span className="font-medium">{item.from?.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                        {item.to?.flag_emoji || countryCodeToFlagEmoji(item.to?.code) || '🏳️'}
                      </span>
                      <span className="font-medium">{item.to?.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><Badge>{item.count}</Badge></TableCell>
                </TableRow>
              ))}
              {(!topSearches || topSearches.length === 0) && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">No visa searches</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function normalizeSource(source: string): string {
  if (!source) return 'direct';
  const lower = source.toLowerCase();
  if (lower.includes('newsletter')) return 'newsletter';
  if (lower.includes('google.')) return 'google';
  if (lower.includes('bing.')) return 'bing';
  if (lower.includes('yahoo.')) return 'yahoo';
  if (lower.includes('duckduckgo.')) return 'duckduckgo';
  if (lower.includes('baidu.')) return 'baidu';
  if (lower.includes('yandex.')) return 'yandex';
  if (lower.includes('facebook.') || lower.includes('fb.')) return 'facebook';
  if (lower.includes('twitter.') || lower.includes('t.co')) return 'twitter';
  if (lower.includes('linkedin.')) return 'linkedin';
  if (lower.includes('reddit.')) return 'reddit';
  if (lower.includes('pinterest.')) return 'pinterest';
  if (lower === 'direct') return 'direct';
  return 'referral';
}

function getSourceDisplayName(source: string): string {
  const names: Record<string, string> = {
    google: 'Google',
    bing: 'Bing',
    yahoo: 'Yahoo',
    duckduckgo: 'DuckDuckGo',
    baidu: 'Baidu',
    yandex: 'Yandex',
    facebook: 'Facebook',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    reddit: 'Reddit',
    pinterest: 'Pinterest',
    newsletter: 'Newsletter',
    direct: 'Direct',
    referral: 'Referral'
  };
  return names[source] || source;
}

function detectSource(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('newsletter:') || lower.startsWith('newsletter')) return 'Newsletter';
  if (lower.includes('google.')) return 'Google';
  if (lower.includes('bing.')) return 'Bing';
  if (lower.includes('yahoo.')) return 'Yahoo';
  if (lower.includes('duckduckgo.')) return 'DuckDuckGo';
  if (lower.includes('baidu.')) return 'Baidu';
  if (lower.includes('yandex.')) return 'Yandex';
  if (lower.includes('facebook.') || lower.includes('fb.com')) return 'Facebook';
  if (lower.includes('twitter.') || lower.includes('t.co') || lower.includes('x.com')) return 'Twitter/X';
  if (lower.includes('linkedin.')) return 'LinkedIn';
  if (lower.includes('reddit.')) return 'Reddit';
  if (lower.includes('pinterest.')) return 'Pinterest';
  if (lower.includes('tiktok.')) return 'TikTok';
  if (lower.includes('instagram.')) return 'Instagram';
  if (lower.includes('youtube.')) return 'YouTube';
  return 'Referral';
}

function getSearchEngineName(source: string | null): string {
  if (!source) return 'Direct';
  const lower = source.toLowerCase();
  if (lower.includes('google')) return 'Google';
  if (lower.includes('bing')) return 'Bing';
  if (lower.includes('yahoo')) return 'Yahoo';
  if (lower.includes('duckduckgo')) return 'DuckDuckGo';
  if (lower.includes('baidu')) return 'Baidu';
  if (lower.includes('yandex')) return 'Yandex';
  if (lower === 'direct') return 'Direct';
  if (lower === 'referral') return 'Referral';
  return source;
}

function getSearchEngineBadgeClass(engine: string): string {
  switch (engine.toLowerCase()) {
    case 'google': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'bing': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
    case 'yahoo': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'duckduckgo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default: return '';
  }
}

function getSourceBadgeClass(source: string): string {
  switch (source.toLowerCase()) {
    case 'google': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'bing': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
    case 'newsletter': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'facebook': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'twitter/x': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
    case 'linkedin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'reddit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'youtube': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'instagram': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    case 'tiktok': return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export default AnalyticsDashboard;
