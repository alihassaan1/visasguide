import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { TrendingUp, Users, Search, Globe, Eye, Clock, MousePointer, FileText, MapPin, Monitor, ExternalLink } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { format, subDays, startOfDay } from "date-fns";

const AnalyticsDashboard = () => {
  // Fetch analytics summary
  const { data: analyticsSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type, created_at, session_duration_seconds')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      const pageViews = data.filter(e => e.event_type === 'page_view').length;
      const searches = data.filter(e => e.event_type === 'search').length;
      const searchEngineReferrals = data.filter(e => e.event_type === 'search_engine_referral').length;
      
      // Calculate real avg session duration
      const sessionsWithDuration = data.filter(e => e.session_duration_seconds && e.session_duration_seconds > 0);
      const avgSessionDuration = sessionsWithDuration.length > 0 
        ? Math.round(sessionsWithDuration.reduce((acc, e) => acc + (e.session_duration_seconds || 0), 0) / sessionsWithDuration.length)
        : 0;
      
      return { pageViews, searches, searchEngineReferrals, total: data.length, avgSessionDuration };
    }
  });

  // Daily traffic trend (last 14 days)
  const { data: dailyTrend } = useQuery({
    queryKey: ['daily-traffic-trend'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at, event_type')
        .gte('created_at', subDays(new Date(), 14).toISOString());
      
      if (error) throw error;
      
      const dailyCounts: Record<string, { date: string, pageViews: number, searches: number }> = {};
      
      for (let i = 13; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        dailyCounts[date] = { date, pageViews: 0, searches: 0 };
      }
      
      data.forEach(event => {
        const date = format(new Date(event.created_at), 'MMM dd');
        if (dailyCounts[date]) {
          if (event.event_type === 'page_view') {
            dailyCounts[date].pageViews++;
          } else if (event.event_type === 'search') {
            dailyCounts[date].searches++;
          }
        }
      });
      
      return Object.values(dailyCounts);
    }
  });

  // Traffic sources with search engine breakdown
  const { data: trafficSources } = useQuery({
    queryKey: ['traffic-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('referrer_source')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      const sources: Record<string, number> = {};
      data.forEach(item => {
        const source = item.referrer_source || 'direct';
        sources[source] = (sources[source] || 0) + 1;
      });
      
      return Object.entries(sources)
        .map(([name, value]) => ({ 
          name: getSearchEngineName(name), 
          originalName: name,
          value 
        }))
        .sort((a, b) => b.value - a.value);
    }
  });

  // Full referring URLs (actual URLs, not just domains)
  const { data: referringUrls } = useQuery({
    queryKey: ['referring-urls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('referrer_source, page_slug, created_at')
        .not('referrer_source', 'is', null)
        .not('referrer_source', 'eq', 'direct')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group by referrer and count
      const urlCounts: Record<string, { url: string, count: number, searchEngine: string | null }> = {};
      data.forEach(item => {
        const url = item.referrer_source || '';
        if (!urlCounts[url]) {
          urlCounts[url] = { 
            url, 
            count: 0, 
            searchEngine: detectSearchEngine(url)
          };
        }
        urlCounts[url].count++;
      });
      
      return Object.values(urlCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    }
  });

  // Search engine keywords with engine name
  const { data: searchEngineQueries } = useQuery({
    queryKey: ['search-engine-queries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('search_engine_query, referrer_source, created_at')
        .not('search_engine_query', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Count frequency with search engine identification
      const queryCounts: Record<string, { query: string, searchEngine: string, count: number }> = {};
      data.forEach(item => {
        const key = `${item.search_engine_query}_${item.referrer_source}`;
        if (!queryCounts[key]) {
          queryCounts[key] = { 
            query: item.search_engine_query!, 
            searchEngine: getSearchEngineName(item.referrer_source),
            count: 0 
          };
        }
        queryCounts[key].count++;
      });
      
      return Object.values(queryCounts).sort((a, b) => b.count - a.count).slice(0, 20);
    }
  });

  // Most viewed country pages
  const { data: topCountryPages } = useQuery({
    queryKey: ['top-country-pages'],
    queryFn: async () => {
      const { data: countries } = await supabase
        .from('countries')
        .select('*');
      
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('page_slug, event_type')
        .eq('event_type', 'page_view');
      
      if (!countries || !analyticsEvents) return [];
      
      const countryPageViews: Record<string, number> = {};
      analyticsEvents.forEach(event => {
        if (event.page_slug?.startsWith('/country/')) {
          const slug = event.page_slug.replace('/country/', '');
          countryPageViews[slug] = (countryPageViews[slug] || 0) + 1;
        }
      });
      
      return countries
        .map(country => ({
          country,
          page_views: countryPageViews[country.slug] || 0,
        }))
        .filter(item => item.page_views > 0)
        .sort((a, b) => b.page_views - a.page_views)
        .slice(0, 10);
    }
  });

  // Top pages by views (all pages)
  const { data: topPages } = useQuery({
    queryKey: ['top-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('page_slug')
        .eq('event_type', 'page_view')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      const pageCounts: Record<string, number> = {};
      data.forEach(item => {
        const slug = item.page_slug || '/';
        pageCounts[slug] = (pageCounts[slug] || 0) + 1;
      });
      
      return Object.entries(pageCounts)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    }
  });

  // Visitor locations
  const { data: visitorLocations } = useQuery({
    queryKey: ['visitor-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('visitor_location')
        .not('visitor_location', 'is', null)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
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

  // Real page performance metrics
  const { data: pagePerformance } = useQuery({
    queryKey: ['page-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('session_duration_seconds, page_slug, event_type')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      // Avg time on page
      const sessionsWithDuration = data.filter(e => e.session_duration_seconds && e.session_duration_seconds > 0);
      const avgTimeOnPage = sessionsWithDuration.length > 0 
        ? Math.round(sessionsWithDuration.reduce((acc, e) => acc + (e.session_duration_seconds || 0), 0) / sessionsWithDuration.length)
        : 0;
      
      // Unique page slugs per "session" approximation
      const uniquePages = new Set(data.filter(e => e.event_type === 'page_view').map(e => e.page_slug)).size;
      const totalPageViews = data.filter(e => e.event_type === 'page_view').length;
      
      // Bounce rate approximation (sessions with only 1 page view)
      const singlePageSessions = data.filter(e => e.session_duration_seconds && e.session_duration_seconds < 10).length;
      const bounceRate = totalPageViews > 0 ? Math.round((singlePageSessions / totalPageViews) * 100) : 0;
      
      // Pages per session
      const pagesPerSession = sessionsWithDuration.length > 0 
        ? (totalPageViews / Math.max(sessionsWithDuration.length, 1)).toFixed(1)
        : '0';
      
      return { avgTimeOnPage, bounceRate, pagesPerSession };
    }
  });

  // Top visa searches (moved to bottom as requested)
  const { data: topSearches } = useQuery({
    queryKey: ['top-searches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select(`
          from_country_id,
          to_country_id,
          from_country:countries!analytics_events_from_country_id_fkey(name, code, flag_emoji, slug),
          to_country:countries!analytics_events_to_country_id_fkey(name, code, flag_emoji, slug)
        `)
        .eq('event_type', 'search')
        .limit(100);
      
      if (error) throw error;
      
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track visitor behavior, searches, and traffic sources</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsSummary?.pageViews.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visa Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsSummary?.searches.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search Engine Visitors</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsSummary?.searchEngineReferrals.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Google, Bing, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analyticsSummary?.avgSessionDuration || 0)}</div>
            <p className="text-xs text-muted-foreground">Time on site</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Traffic Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Traffic Trend (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="pageViews" stroke="hsl(var(--primary))" strokeWidth={2} name="Page Views" />
              <Line type="monotone" dataKey="searches" stroke="hsl(var(--secondary))" strokeWidth={2} name="Searches" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Traffic Sources Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
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

        {/* Page Performance Metrics - NOW REAL DATA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Monitor className="h-5 w-5" />
              Page Performance
            </CardTitle>
            <p className="text-xs text-muted-foreground">Real metrics from analytics data</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Avg. Time on Page</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {formatDuration(pagePerformance?.avgTimeOnPage || 0)}
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MousePointer className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Bounce Rate</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{pagePerformance?.bounceRate || 0}%</div>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Pages per Session</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{pagePerformance?.pagesPerSession || '0'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Page</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs sm:text-sm font-mono truncate max-w-[200px]">
                      {item.page || '/'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.views}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!topPages || topPages.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">No data yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Visitor Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin className="h-5 w-5" />
              Visitor Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Country</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitorLocations?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-xs sm:text-sm font-medium">{item.country}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.count}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!visitorLocations || visitorLocations.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">No location data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Most Viewed Country Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Globe className="h-5 w-5" />
            Most Viewed Country Pages
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Country</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Page Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCountryPages?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl" style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                        {item.country?.flag_emoji || countryCodeToFlagEmoji(item.country?.code) || '🏳️'}
                      </span>
                      <span className="font-medium text-xs sm:text-sm">{item.country?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{item.page_views}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!topCountryPages || topCountryPages.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-4">No country page views yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Search Engine Keywords with Engine Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Engine Keywords</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">Keywords with search engine identification</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Keyword</TableHead>
                <TableHead className="text-xs sm:text-sm">Search Engine</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchEngineQueries?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-xs sm:text-sm">{item.query}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSearchEngineBadgeClass(item.searchEngine)}`}
                    >
                      {item.searchEngine}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge>{item.count}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!searchEngineQueries || searchEngineQueries.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                    No search engine keywords captured yet. Keywords are captured from referrer URLs when available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Referring URLs - NOW WITH ACTUAL URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <ExternalLink className="h-5 w-5" />
            Top Referring URLs
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">External sites driving traffic to your site</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Referring URL / Source</TableHead>
                <TableHead className="text-xs sm:text-sm">Type</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Visits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referringUrls?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {item.url.startsWith('http') ? (
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs sm:text-sm break-all max-w-[300px] truncate block"
                      >
                        {item.url}
                      </a>
                    ) : (
                      <span className="text-xs sm:text-sm">{item.url}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.searchEngine ? (
                      <Badge variant="outline" className={`text-xs ${getSearchEngineBadgeClass(item.searchEngine)}`}>
                        {item.searchEngine}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Referral</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge>{item.count}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!referringUrls || referringUrls.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                    No external referrers yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Visa Searches - NOW AT BOTTOM */}
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
                <TableHead className="text-right">Search Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSearches?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                        {item.from?.flag_emoji || countryCodeToFlagEmoji(item.from?.code) || '🏳️'}
                      </span>
                      <span className="font-medium">{item.from?.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                        {item.to?.flag_emoji || countryCodeToFlagEmoji(item.to?.code) || '🏳️'}
                      </span>
                      <span className="font-medium">{item.to?.name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge>{item.count}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!topSearches || topSearches.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                    No visa searches recorded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function getSearchEngineName(source: string | null): string {
  if (!source) return 'Direct';
  const lowerSource = source.toLowerCase();
  if (lowerSource.includes('google')) return 'Google';
  if (lowerSource.includes('bing')) return 'Bing';
  if (lowerSource.includes('yahoo')) return 'Yahoo';
  if (lowerSource.includes('duckduckgo')) return 'DuckDuckGo';
  if (lowerSource.includes('baidu')) return 'Baidu';
  if (lowerSource.includes('yandex')) return 'Yandex';
  if (lowerSource === 'direct') return 'Direct';
  if (lowerSource === 'referral') return 'Referral';
  return source;
}

function detectSearchEngine(url: string): string | null {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('google.')) return 'Google';
  if (lowerUrl.includes('bing.')) return 'Bing';
  if (lowerUrl.includes('yahoo.')) return 'Yahoo';
  if (lowerUrl.includes('duckduckgo.')) return 'DuckDuckGo';
  if (lowerUrl.includes('baidu.')) return 'Baidu';
  if (lowerUrl.includes('yandex.')) return 'Yandex';
  return null;
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

export default AnalyticsDashboard;
