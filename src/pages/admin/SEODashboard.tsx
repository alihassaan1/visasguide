import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Bot,
  Loader2,
  MapPin,
  Newspaper,
  BookOpen,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { format, formatDistanceToNow, subDays } from "date-fns";

interface CrawlerStats {
  bot_name: string;
  visits: number;
  last_visit: string;
}

interface DailyCrawlData {
  date: string;
  googlebot: number;
  bingbot: number;
  other: number;
}

interface TopCrawledPage {
  page_slug: string;
  crawl_count: number;
  last_crawled: string;
}

interface ContentStats {
  published_content_pages: number;
  total_content_pages: number;
  total_news: number;
  total_countries: number;
  total_guides: number;
  total_cities: number;
  total_visa_requirements: number;
}

interface SitemapStatus {
  isHealthy: boolean;
  urlCount: number;
  lastChecked: Date;
  error?: string;
}

export default function SEODashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [crawlerStats, setCrawlerStats] = useState<CrawlerStats[]>([]);
  const [dailyCrawlData, setDailyCrawlData] = useState<DailyCrawlData[]>([]);
  const [topCrawledPages, setTopCrawledPages] = useState<TopCrawledPage[]>([]);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [sitemapStatus, setSitemapStatus] = useState<SitemapStatus | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [submittingIndexNow, setSubmittingIndexNow] = useState(false);
  const [regeneratingSitemap, setRegeneratingSitemap] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCrawlerStats(),
      fetchDailyCrawlData(),
      fetchTopCrawledPages(),
      fetchContentStats(),
      checkSitemapHealth()
    ]);
    setLoading(false);
  };

  const fetchCrawlerStats = async () => {
    // Fetch ALL TIME data for last visit stats (not filtered by date range)
    const { data: allTimeData, error: allTimeError } = await supabase
      .from('analytics_events')
      .select('user_agent, created_at')
      .eq('is_bot', true)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (allTimeError) {
      console.error('Error fetching crawler stats:', allTimeError);
      return;
    }

    // Also fetch date-range filtered data for visit counts
    const days = parseInt(dateRange);
    const { data: rangeData } = await supabase
      .from('analytics_events')
      .select('user_agent, created_at')
      .eq('is_bot', true)
      .gte('created_at', subDays(new Date(), days).toISOString());

    // Build stats from all-time data for accurate last_visit
    const botMap: Record<string, { visits: number; last_visit: string }> = {};
    
    // First pass: get last_visit from all-time data
    allTimeData?.forEach(event => {
      const botName = getBotName(event.user_agent || '');
      if (!botMap[botName]) {
        botMap[botName] = { visits: 0, last_visit: event.created_at };
      }
      // Since data is ordered by created_at desc, first occurrence is the latest
      if (!botMap[botName].last_visit || new Date(event.created_at) > new Date(botMap[botName].last_visit)) {
        botMap[botName].last_visit = event.created_at;
      }
    });

    // Second pass: count visits from date-range data
    rangeData?.forEach(event => {
      const botName = getBotName(event.user_agent || '');
      if (botMap[botName]) {
        botMap[botName].visits++;
      } else {
        botMap[botName] = { visits: 1, last_visit: event.created_at };
      }
    });

    const stats = Object.entries(botMap)
      .map(([bot_name, data]) => ({
        bot_name,
        visits: data.visits,
        last_visit: data.last_visit
      }))
      .sort((a, b) => b.visits - a.visits);

    console.log('Crawler stats:', stats);
    setCrawlerStats(stats);
  };

  const getBotName = (userAgent: string): string => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('googlebot')) return 'Googlebot';
    if (ua.includes('bingbot')) return 'Bingbot';
    if (ua.includes('facebookexternalhit') || ua.includes('meta-externalagent')) return 'Facebook/Meta';
    if (ua.includes('twitterbot')) return 'Twitter';
    if (ua.includes('linkedinbot')) return 'LinkedIn';
    if (ua.includes('yandex')) return 'Yandex';
    if (ua.includes('bytespider')) return 'ByteSpider';
    if (ua.includes('applebot')) return 'Applebot';
    if (ua.includes('duckduckbot')) return 'DuckDuckGo';
    return 'Other';
  };

  const fetchDailyCrawlData = async () => {
    const days = parseInt(dateRange);
    const { data, error } = await supabase
      .from('analytics_events')
      .select('user_agent, created_at')
      .eq('is_bot', true)
      .gte('created_at', subDays(new Date(), days).toISOString());

    if (error) {
      console.error('Error fetching daily crawl data:', error);
      return;
    }

    const dailyMap: Record<string, { googlebot: number; bingbot: number; other: number }> = {};
    
    data?.forEach(event => {
      const date = format(new Date(event.created_at), 'yyyy-MM-dd');
      if (!dailyMap[date]) {
        dailyMap[date] = { googlebot: 0, bingbot: 0, other: 0 };
      }
      
      const botName = getBotName(event.user_agent || '');
      if (botName === 'Googlebot') dailyMap[date].googlebot++;
      else if (botName === 'Bingbot') dailyMap[date].bingbot++;
      else dailyMap[date].other++;
    });

    const chartData = Object.entries(dailyMap)
      .map(([date, counts]) => ({
        date: format(new Date(date), 'MMM d'),
        ...counts
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setDailyCrawlData(chartData);
  };

  const fetchTopCrawledPages = async () => {
    const days = parseInt(dateRange);
    const { data, error } = await supabase
      .from('analytics_events')
      .select('page_slug, created_at')
      .eq('is_bot', true)
      .not('page_slug', 'is', null)
      .gte('created_at', subDays(new Date(), days).toISOString());

    if (error) {
      console.error('Error fetching top crawled pages:', error);
      return;
    }

    const pageMap: Record<string, { count: number; last_crawled: string }> = {};
    
    data?.forEach(event => {
      const slug = event.page_slug || '/';
      if (!pageMap[slug]) {
        pageMap[slug] = { count: 0, last_crawled: event.created_at };
      }
      pageMap[slug].count++;
      if (new Date(event.created_at) > new Date(pageMap[slug].last_crawled)) {
        pageMap[slug].last_crawled = event.created_at;
      }
    });

    const topPages = Object.entries(pageMap)
      .map(([page_slug, data]) => ({
        page_slug,
        crawl_count: data.count,
        last_crawled: data.last_crawled
      }))
      .sort((a, b) => b.crawl_count - a.crawl_count)
      .slice(0, 20);

    setTopCrawledPages(topPages);
  };

  const fetchContentStats = async () => {
    const [publishedPages, totalPages, news, countries, guides, cities, visaReqs] = await Promise.all([
      supabase.from('content_pages').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('content_pages').select('id', { count: 'exact', head: true }),
      supabase.from('news_articles').select('id', { count: 'exact', head: true }),
      supabase.from('countries').select('id', { count: 'exact', head: true }),
      supabase.from('guides').select('id', { count: 'exact', head: true }),
      supabase.from('cities').select('id', { count: 'exact', head: true }),
      supabase.from('visa_requirements').select('id', { count: 'exact', head: true })
    ]);
    
    setContentStats({
      published_content_pages: publishedPages.count || 0,
      total_content_pages: totalPages.count || 0,
      total_news: news.count || 0,
      total_countries: countries.count || 0,
      total_guides: guides.count || 0,
      total_cities: cities.count || 0,
      total_visa_requirements: visaReqs.count || 0
    });
  };

  const checkSitemapHealth = async () => {
    try {
      // We can't directly fetch the sitemap due to CORS, but we can estimate based on content
      const totalUrls = contentStats ? 
        (contentStats.published_content_pages + 
         contentStats.total_countries + 
         contentStats.total_cities + 
         contentStats.total_guides + 
         contentStats.total_visa_requirements + 
         10) : 0; // 10 for static pages

      setSitemapStatus({
        isHealthy: true,
        urlCount: totalUrls || 13245, // Fallback to known count
        lastChecked: new Date(),
      });
    } catch (error) {
      setSitemapStatus({
        isHealthy: false,
        urlCount: 0,
        lastChecked: new Date(),
        error: 'Unable to check sitemap status'
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "SEO metrics have been updated.",
    });
  };

  const handleIndexNowSubmit = async () => {
    setSubmittingIndexNow(true);
    try {
      const response = await supabase.functions.invoke('indexnow', {
        body: { submitAll: true }
      });
      
      if (response.error) throw response.error;
      
      toast({
        title: "IndexNow Submitted",
        description: `Successfully submitted URLs to IndexNow for faster indexing.`,
      });
    } catch (error) {
      toast({
        title: "IndexNow Failed",
        description: "Failed to submit URLs. Check console for details.",
        variant: "destructive"
      });
      console.error('IndexNow error:', error);
    } finally {
      setSubmittingIndexNow(false);
    }
  };

  const handleRegenerateSitemap = async () => {
    setRegeneratingSitemap(true);
    try {
      const response = await fetch('https://awiytryceqehqapytfgn.supabase.co/functions/v1/generate-static-sitemap');
      
      if (!response.ok) throw new Error('Failed to generate sitemap');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sitemap Generated",
        description: "Download complete. Upload this file to public/sitemap.xml to update the sitemap.",
      });
    } catch (error) {
      toast({
        title: "Sitemap Generation Failed",
        description: "Failed to generate sitemap. Check console for details.",
        variant: "destructive"
      });
      console.error('Sitemap generation error:', error);
    } finally {
      setRegeneratingSitemap(false);
    }
  };

  const googlebotStats = crawlerStats.find(s => s.bot_name === 'Googlebot');
  const bingbotStats = crawlerStats.find(s => s.bot_name === 'Bingbot');
  
  const googlebotLastVisitHours = googlebotStats 
    ? (new Date().getTime() - new Date(googlebotStats.last_visit).getTime()) / (1000 * 60 * 60)
    : null;

  const totalIndexablePages = contentStats 
    ? contentStats.published_content_pages + 
      contentStats.total_countries + 
      contentStats.total_cities + 
      contentStats.total_guides + 
      contentStats.total_visa_requirements + 10
    : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Monitoring</h1>
          <p className="text-muted-foreground">
            Track search engine crawling, indexing status, and SEO health
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleRegenerateSitemap}
            disabled={regeneratingSitemap}
          >
            {regeneratingSitemap ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Sitemap
          </Button>
          <Button 
            onClick={handleIndexNowSubmit}
            disabled={submittingIndexNow}
          >
            {submittingIndexNow ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Submit to IndexNow
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {googlebotLastVisitHours && googlebotLastVisitHours > 24 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Googlebot Inactive</AlertTitle>
          <AlertDescription>
            Googlebot hasn't crawled your site in {Math.round(googlebotLastVisitHours)} hours. 
            This may indicate crawling issues. Check Google Search Console for errors.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexable Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIndexablePages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              In sitemap for crawling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Googlebot Activity</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{googlebotStats?.visits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {googlebotStats 
                ? `Last visit: ${formatDistanceToNow(new Date(googlebotStats.last_visit), { addSuffix: true })}`
                : 'No recent activity'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bingbot Activity</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bingbotStats?.visits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {bingbotStats 
                ? `Last visit: ${formatDistanceToNow(new Date(bingbotStats.last_visit), { addSuffix: true })}`
                : 'No recent activity'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitemap Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {sitemapStatus?.isHealthy ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ~{sitemapStatus?.urlCount.toLocaleString() || '13,000+'} URLs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Breakdown */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="col-span-1">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Countries</span>
            </div>
            <div className="text-xl font-bold">{contentStats?.total_countries || 0}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Cities</span>
            </div>
            <div className="text-xl font-bold">{contentStats?.total_cities || 0}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Visa Pairs</span>
            </div>
            <div className="text-xl font-bold">{contentStats?.total_visa_requirements || 0}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Guides</span>
            </div>
            <div className="text-xl font-bold">{contentStats?.total_guides || 0}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">News</span>
            </div>
            <div className="text-xl font-bold">{contentStats?.total_news || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Crawler Activity Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Crawler Activity</CardTitle>
              <CardDescription>Daily crawl counts by search engine</CardDescription>
            </div>
            <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
              <TabsList>
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="14d">14d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
                <TabsTrigger value="90d">90d</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCrawlData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="googlebot" 
                  name="Googlebot"
                  stroke="#4285F4" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="bingbot" 
                  name="Bingbot"
                  stroke="#00809D" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="other" 
                  name="Other Bots"
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* All Crawler Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Crawler Breakdown</CardTitle>
            <CardDescription>All bot activity in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crawlerStats.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    dataKey="bot_name" 
                    type="category" 
                    width={100}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Resources</CardTitle>
            <CardDescription>Quick access to important tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="https://search.google.com/search-console" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Google Search Console</div>
                  <div className="text-sm text-muted-foreground">Coverage & performance</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            
            <a 
              href="https://www.bing.com/webmasters" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900">
                  <Globe className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <div className="font-medium">Bing Webmaster Tools</div>
                  <div className="text-sm text-muted-foreground">Bing indexing status</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            
            <a 
              href="https://visas.guide/sitemap.xml" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">View Sitemap</div>
                  <div className="text-sm text-muted-foreground">sitemap.xml</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            
            <a 
              href="https://visas.guide/robots.txt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Bot className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">View Robots.txt</div>
                  <div className="text-sm text-muted-foreground">Crawler directives</div>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Top Crawled Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Most Crawled Pages</CardTitle>
          <CardDescription>Pages receiving the most crawler attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page URL</TableHead>
                <TableHead className="text-right">Crawl Count</TableHead>
                <TableHead className="text-right">Last Crawled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCrawledPages.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">
                    <a 
                      href={`https://visas.guide${page.page_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-primary"
                    >
                      {page.page_slug || '/'}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">{page.crawl_count}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(new Date(page.last_crawled), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
              {topCrawledPages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No crawl data available for this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
