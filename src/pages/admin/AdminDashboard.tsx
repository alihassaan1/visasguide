import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Sparkles, Eye, DollarSign, Globe, Loader2, Clock, Zap, AlertCircle, CheckCircle2, ShieldCheck, ImageOff, UserX, Wrench } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function AdminDashboard() {
  // Fetch content pages count
  const { data: pageStats, isLoading: pagesLoading } = useQuery({
    queryKey: ['admin-pages-stats'],
    queryFn: async () => {
      const [totalRes, aiRes, topPagesRes] = await Promise.all([
        supabase.from('content_pages').select('id', { count: 'exact', head: true }),
        supabase.from('content_pages').select('id', { count: 'exact', head: true }).eq('ai_generated', true),
        supabase.from('content_pages').select('id, title, slug, view_count').order('view_count', { ascending: false }).limit(10),
      ]);
      return {
        total: totalRes.count || 0,
        aiGenerated: aiRes.count || 0,
        topPages: topPagesRes.data || [],
      };
    },
    staleTime: 30000,
  });

  // Fetch newsletter subscribers count
  const { data: subsCount = 0, isLoading: subsLoading } = useQuery({
    queryKey: ['admin-subscribers-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      return count || 0;
    },
    staleTime: 30000,
  });

  // Fetch user roles count (freelancers)
  const { data: freelancerCount = 0, isLoading: freelancersLoading } = useQuery({
    queryKey: ['admin-freelancers-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 30000,
  });

  // Fetch affiliate clicks
  const { data: affiliateClicks = 0, isLoading: affiliatesLoading } = useQuery({
    queryKey: ['admin-affiliate-clicks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings_affiliates')
        .select('click_count');
      return data?.reduce((sum, aff) => sum + (aff.click_count || 0), 0) || 0;
    },
    staleTime: 30000,
  });

  // Fetch AI generations count
  const { data: aiGenerationsCount = 0, isLoading: aiLoading } = useQuery({
    queryKey: ['admin-ai-generations-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('ai_generations')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 30000,
  });

  // Fetch analytics events
  const { data: analyticsEvents = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('analytics_events')
        .select('event_type, page_slug, created_at');
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch visa requirements progress
  const { data: visaProgress, isLoading: visaProgressLoading } = useQuery({
    queryKey: ['admin-visa-progress'],
    queryFn: async () => {
      const now = new Date();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [countriesRes, visaContentRes, recentBatches, last24hContent, apiErrors] = await Promise.all([
        supabase.from("countries").select("id", { count: "exact", head: true }),
        supabase.from("content_pages").select("id", { count: "exact", head: true }).like("slug", "%-to-%-visa-requirements"),
        supabase
          .from("activity_log")
          .select("metadata, created_at")
          .eq("action", "content_agent_status")
          .eq("entity_type", "visa_requirements_content")
          .gte("created_at", lastHour.toISOString())
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("content_pages")
          .select("id", { count: "exact", head: true })
          .like("slug", "%-to-%-visa-requirements")
          .gte("created_at", last24h.toISOString()),
        supabase
          .from("api_logs")
          .select("error_message, created_at")
          .eq("status", "error")
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      const totalCountries = countriesRes.count || 0;
      const totalCombinations = totalCountries * (totalCountries - 1);
      const completedPages = visaContentRes.count || 0;
      const pagesLast24h = last24hContent.count || 0;

      // Calculate speed from recent batches
      const completedBatches = (recentBatches.data || []).filter(
        (b) => (b.metadata as any)?.status === 'batch_complete'
      );

      let pagesPerHour = 0;
      let lastBatchTime: string | null = null;

      if (completedBatches.length > 0) {
        const totalPagesThisHour = completedBatches.reduce(
          (sum, b) => sum + ((b.metadata as any)?.generated || 0), 0
        );
        pagesPerHour = (completedBatches[0]?.metadata as any)?.pages_per_hour || totalPagesThisHour;
        lastBatchTime = completedBatches[0]?.created_at;
      }

      const remaining = totalCombinations - completedPages;
      const estimatedHoursRemaining = pagesPerHour > 0 ? remaining / pagesPerHour : 0;
      const percentComplete = totalCombinations > 0 ? (completedPages / totalCombinations) * 100 : 0;

      // Check for recent errors
      const latestError = apiErrors.data?.[0];
      const hasRecentError = latestError && 
        new Date(latestError.created_at).getTime() > now.getTime() - 10 * 60 * 1000;

      return {
        totalCombinations,
        completedPages,
        remaining,
        percentComplete,
        pagesPerHour,
        pagesLast24h,
        estimatedHoursRemaining,
        estimatedDaysRemaining: estimatedHoursRemaining / 24,
        lastBatchTime,
        hasRecentError,
        errorMessage: hasRecentError ? latestError?.error_message : null,
      };
    },
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10000,
  });

  // Fetch content health stats
  const queryClient = useQueryClient();
  const { data: contentHealth, isLoading: contentHealthLoading } = useQuery({
    queryKey: ['admin-content-health'],
    queryFn: async () => {
      const [
        { count: totalPages },
        { count: pagesWithWrapper },
        { count: pagesWithoutImages },
        { count: pagesWithoutAuthors },
      ] = await Promise.all([
        supabase.from('content_pages').select('id', { count: 'exact', head: true }),
        supabase.from('content_pages').select('id', { count: 'exact', head: true })
          .or('content.ilike.%<!DOCTYPE%,content.ilike.%<html%,content.ilike.%```html%'),
        supabase.from('content_pages').select('id', { count: 'exact', head: true })
          .is('featured_image_url', null),
        supabase.from('content_pages').select('id', { count: 'exact', head: true })
          .is('author_id', null),
      ]);

      const total = totalPages || 0;
      const dirty = pagesWithWrapper || 0;
      const clean = total - dirty;
      
      return {
        totalPages: total,
        pagesWithWrapper: dirty,
        cleanPages: clean,
        pagesWithoutImages: pagesWithoutImages || 0,
        pagesWithoutAuthors: pagesWithoutAuthors || 0,
        healthScore: total > 0 ? Math.round((clean / total) * 100) : 100,
      };
    },
    staleTime: 30000,
  });

  // Content cleaner mutation
  const cleanerMutation = useMutation({
    mutationFn: async (options: { dryRun?: boolean; assignAuthors?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('content-cleaner', {
        body: { batchSize: 100, ...options }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.dryRun) {
        toast.info(`Dry run: Would clean ${data.results.cleaned} pages`);
      } else {
        toast.success(`Cleaned ${data.results.cleaned} pages`);
        queryClient.invalidateQueries({ queryKey: ['admin-content-health'] });
      }
    },
    onError: (error) => {
      toast.error(`Cleanup failed: ${error.message}`);
    }
  });

  // Calculate derived stats
  const pageViews = analyticsEvents.filter(e => e.event_type === 'page_view');
  const totalViews = pageViews.length;
  const aiGeneratedPages = pageStats?.aiGenerated || 0;
  const totalPages = pageStats?.total || 0;

  // Count views per page slug from analytics
  const pageViewCounts: Record<string, number> = {};
  pageViews.forEach(view => {
    if (view.page_slug) {
      pageViewCounts[view.page_slug] = (pageViewCounts[view.page_slug] || 0) + 1;
    }
  });

  // Get top pages with actual view counts (from query)
  const topPages = (pageStats?.topPages || []).map(page => ({
    ...page,
    view_count: pageViewCounts[page.slug] || page.view_count || 0
  })).sort((a, b) => b.view_count - a.view_count);

  // Generate monthly data from actual analytics
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      monthNum: date.getMonth()
    };
  });

  // Monthly data now simplified - we no longer have all pages loaded
  const monthlyData = last6Months.map(({ month, year, monthNum }) => {
    const monthViews = pageViews.filter((view: any) => {
      const viewDate = new Date(view.created_at);
      return viewDate.getMonth() === monthNum && viewDate.getFullYear() === year;
    }).length;
    
    return {
      month,
      views: monthViews,
      posts: 0 // We can't calculate this without loading all pages
    };
  });

  const isLoading = pagesLoading || analyticsLoading;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    loading 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    description: string;
    loading?: boolean;
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
          <CardTitle className="text-3xl">{typeof value === 'number' ? value.toLocaleString() : value}</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Complete overview of Visas.Guide performance</p>
      </div>

      {/* Visa Requirements Progress Tracker */}
      <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Visa Requirements Generation Progress</CardTitle>
            </div>
            <Link to="/admin/agent">
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Agent Dashboard
              </Button>
            </Link>
          </div>
          <CardDescription>
            AI-powered content generation for all country combinations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visaProgressLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            </div>
          ) : visaProgress ? (
            <>
              {/* Error Alert */}
              {visaProgress.hasRecentError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {visaProgress.errorMessage?.includes("Insufficient Balance") 
                      ? "DeepSeek API balance depleted. Please top up your account to continue generation."
                      : visaProgress.errorMessage || "Generation paused due to API errors"}
                  </AlertDescription>
                </Alert>
              )}

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {visaProgress.completedPages.toLocaleString()} / {visaProgress.totalCombinations.toLocaleString()} pages
                  </span>
                  <span className="text-primary font-bold">
                    {visaProgress.percentComplete.toFixed(2)}%
                  </span>
                </div>
                <Progress value={visaProgress.percentComplete} className="h-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{visaProgress.remaining.toLocaleString()} remaining</span>
                  <span className="flex items-center gap-1">
                    {visaProgress.pagesPerHour > 0 ? (
                      <>
                        <Zap className="h-3 w-3 text-green-500" />
                        {visaProgress.pagesPerHour.toLocaleString()} pages/hour
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Calculating speed...
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {visaProgress.pagesLast24h.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Pages (24h)</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">
                    {visaProgress.pagesPerHour > 0 ? visaProgress.pagesPerHour.toLocaleString() : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Pages/Hour</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">
                    {visaProgress.estimatedDaysRemaining > 0 
                      ? visaProgress.estimatedDaysRemaining < 1 
                        ? `${Math.ceil(visaProgress.estimatedHoursRemaining)}h`
                        : `${Math.ceil(visaProgress.estimatedDaysRemaining)}d`
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">ETA</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    {visaProgress.hasRecentError ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : visaProgress.pagesPerHour > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {visaProgress.hasRecentError 
                      ? "Error" 
                      : visaProgress.pagesPerHour > 0 
                        ? "Running" 
                        : "Idle"}
                  </p>
                </div>
              </div>

              {/* Last Activity */}
              {visaProgress.lastBatchTime && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Last batch: {formatDistanceToNow(new Date(visaProgress.lastBatchTime), { addSuffix: true })}
                </p>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Content Health Card - AdSense Readiness */}
      <Card className="mb-8 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              <CardTitle>Content Health (AdSense Readiness)</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => cleanerMutation.mutate({ dryRun: true })}
                disabled={cleanerMutation.isPending}
              >
                {cleanerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Preview Cleanup
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => cleanerMutation.mutate({ dryRun: false, assignAuthors: true })}
                disabled={cleanerMutation.isPending}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Run Cleanup
              </Button>
            </div>
          </div>
          <CardDescription>
            Fix content issues before applying for AdSense
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contentHealthLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : contentHealth ? (
            <>
              {/* Health Score */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Content Quality Score</span>
                <Badge variant={contentHealth.healthScore >= 90 ? "default" : contentHealth.healthScore >= 70 ? "secondary" : "destructive"}>
                  {contentHealth.healthScore}%
                </Badge>
              </div>
              <Progress 
                value={contentHealth.healthScore} 
                className={`h-2 ${contentHealth.healthScore < 70 ? '[&>div]:bg-destructive' : contentHealth.healthScore < 90 ? '[&>div]:bg-amber-500' : ''}`}
              />
              
              {/* Issue Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertCircle className={`h-4 w-4 ${contentHealth.pagesWithWrapper > 0 ? 'text-destructive' : 'text-green-500'}`} />
                  </div>
                  <p className="text-2xl font-bold">
                    {contentHealth.pagesWithWrapper.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">HTML Wrapper Issues</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ImageOff className={`h-4 w-4 ${contentHealth.pagesWithoutImages > 0 ? 'text-amber-500' : 'text-green-500'}`} />
                  </div>
                  <p className="text-2xl font-bold">
                    {contentHealth.pagesWithoutImages.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Missing Images</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <UserX className={`h-4 w-4 ${contentHealth.pagesWithoutAuthors > 0 ? 'text-amber-500' : 'text-green-500'}`} />
                  </div>
                  <p className="text-2xl font-bold">
                    {contentHealth.pagesWithoutAuthors.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Missing Authors</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {contentHealth.cleanPages.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Clean Pages</p>
                </div>
              </div>

              {/* Warning if issues exist */}
              {contentHealth.pagesWithWrapper > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {contentHealth.pagesWithWrapper} pages have HTML document wrappers that may cause AdSense rejection. Click "Run Cleanup" to fix.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard 
          title="Total Pages" 
          value={totalPages} 
          icon={FileText} 
          description={`${aiGeneratedPages.toLocaleString()} AI-generated (${totalPages > 0 ? Math.round((aiGeneratedPages / totalPages) * 100) : 0}%)`}
          loading={pagesLoading}
        />
        <StatCard 
          title="Total Views" 
          value={totalViews} 
          icon={Eye} 
          description={`Avg: ${totalPages > 0 ? Math.round(totalViews / totalPages) : 0} per page`}
          loading={analyticsLoading}
        />
        <StatCard 
          title="Newsletter Subscribers" 
          value={subsCount} 
          icon={Users} 
          description="Active subscribers"
          loading={subsLoading}
        />
        <StatCard 
          title="AI Content Generated" 
          value={aiGenerationsCount} 
          icon={Sparkles} 
          description="AI generations"
          loading={aiLoading}
        />
        <StatCard 
          title="Affiliate Clicks" 
          value={affiliateClicks} 
          icon={DollarSign} 
          description="Total tracked clicks"
          loading={affiliatesLoading}
        />
        <StatCard 
          title="Active Freelancers" 
          value={freelancerCount} 
          icon={Users} 
          description="Content creators"
          loading={freelancersLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Traffic</CardTitle>
            <CardDescription>Page views over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Growth</CardTitle>
            <CardDescription>Posts published per month</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="posts" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Pages</CardTitle>
          <CardDescription>Most viewed content on Visas.Guide</CardDescription>
        </CardHeader>
        <CardContent>
          {pagesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : topPages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pages yet</p>
          ) : (
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <div key={page.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{page.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">/{page.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(page.view_count || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">views</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
