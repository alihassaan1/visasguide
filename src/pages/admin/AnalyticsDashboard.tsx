import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Search, Globe, Eye } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";

const AnalyticsDashboard = () => {
  // Fetch analytics summary
  const { data: analyticsSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      const pageViews = data.filter(e => e.event_type === 'page_view').length;
      const searches = data.filter(e => e.event_type === 'search').length;
      const searchEngineReferrals = data.filter(e => e.event_type === 'search_engine_referral').length;
      
      return { pageViews, searches, searchEngineReferrals, total: data.length };
    }
  });

  // Top searched countries
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
      
      // Count frequency of searches
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

  // Most viewed country pages
  const { data: topCountryPages } = useQuery({
    queryKey: ['top-country-pages'],
    queryFn: async () => {
      // Get all countries
      const { data: countries } = await supabase
        .from('countries')
        .select('*');
      
      // Get analytics events for country pages
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('page_slug, event_type')
        .eq('event_type', 'page_view');
      
      if (!countries || !analyticsEvents) return [];
      
      // Count views per country page (slug format: /country/[slug])
      const countryPageViews: Record<string, number> = {};
      analyticsEvents.forEach(event => {
        if (event.page_slug?.startsWith('/country/')) {
          const slug = event.page_slug.replace('/country/', '');
          countryPageViews[slug] = (countryPageViews[slug] || 0) + 1;
        }
      });
      
      // Map to countries and sort by views
      return countries
        .map(country => ({
          country,
          page_views: countryPageViews[country.slug] || 0,
          searches: 0
        }))
        .filter(item => item.page_views > 0)
        .sort((a, b) => b.page_views - a.page_views)
        .slice(0, 10);
    }
  });

  // Traffic sources
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
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }
  });

  // Search engine queries
  const { data: searchEngineQueries } = useQuery({
    queryKey: ['search-engine-queries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('search_engine_query, referrer_source, created_at')
        .eq('event_type', 'search_engine_referral')
        .not('search_engine_query', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Count frequency
      const queryCounts: Record<string, { query: string, source: string, count: number }> = {};
      data.forEach(item => {
        const key = item.search_engine_query!;
        if (!queryCounts[key]) {
          queryCounts[key] = { query: key, source: item.referrer_source, count: 0 };
        }
        queryCounts[key].count++;
      });
      
      return Object.values(queryCounts).sort((a, b) => b.count - a.count).slice(0, 20);
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track visitor behavior, searches, and traffic sources</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
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
            <p className="text-xs text-muted-foreground">From Google, Bing, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsSummary?.total.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All analytics events</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Visa Searches */}
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Country Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Most Viewed Country Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Page Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCountryPages?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                          {item.country?.flag_emoji || countryCodeToFlagEmoji(item.country?.code) || '🏳️'}
                        </span>
                        <span className="font-medium">{item.country?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.page_views}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
      </div>

      {/* Search Engine Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Search Engine Keywords</CardTitle>
          <p className="text-sm text-muted-foreground">Track what keywords bring visitors from Google, Bing, etc.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Search Query</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchEngineQueries?.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.query}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{item.source}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge>{item.count}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
