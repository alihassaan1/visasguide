import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Sparkles, Eye, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
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

  const monthlyData = last6Months.map(({ month, year, monthNum }) => {
    const monthViews = pageViews.filter((view: any) => {
      const viewDate = new Date(view.created_at);
      return viewDate.getMonth() === monthNum && viewDate.getFullYear() === year;
    }).length;
    
    return {
      month,
      views: monthViews,
      posts: 0
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
