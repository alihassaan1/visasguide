import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, Sparkles, Eye, TrendingUp, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalPages: 0,
    totalViews: 0,
    aiGeneratedPages: 0,
    aiGenerations: 0,
    activeFreelancers: 0,
    newsletterSubs: 0,
    affiliateClicks: 0
  });
  const [topPages, setTopPages] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // Get content stats
      const { data: pages } = await supabase
        .from('content_pages')
        .select('*');

      // Get newsletter subscribers
      const { data: subs } = await supabase
        .from('newsletter_subscribers')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      // Get freelancer count - count all users with role
      const { count: freelancerCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      // Get affiliate clicks total
      const { data: affiliates } = await supabase
        .from('settings_affiliates')
        .select('click_count');

      const affiliateClicksTotal = affiliates?.reduce((sum, aff) => sum + (aff.click_count || 0), 0) || 0;

      // Count AI generations (from ai_generations table)
      const { count: aiGenerationsCount } = await supabase
        .from('ai_generations')
        .select('*', { count: 'exact', head: true });

      // Get real analytics data
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('event_type, page_slug, created_at');

      const pageViews = analyticsEvents?.filter(e => e.event_type === 'page_view') || [];
      const totalViews = pageViews.length;
      const aiGeneratedPages = pages?.filter((p: any) => p.ai_generated).length || 0;

      // Count views per page slug from analytics
      const pageViewCounts: Record<string, number> = {};
      pageViews.forEach(view => {
        if (view.page_slug) {
          pageViewCounts[view.page_slug] = (pageViewCounts[view.page_slug] || 0) + 1;
        }
      });

      // Get top pages with actual view counts
      const topPagesList = pages
        ?.map(page => ({
          ...page,
          view_count: pageViewCounts[page.slug] || 0
        }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10) || [];

      setStats({
        totalPages: pages?.length || 0,
        totalViews,
        aiGeneratedPages,
        aiGenerations: aiGenerationsCount || 0,
        activeFreelancers: freelancerCount || 0,
        newsletterSubs: subs?.length || 0,
        affiliateClicks: affiliateClicksTotal
      });

      setTopPages(topPagesList);

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

      const monthlyStats = last6Months.map(({ month, year, monthNum }) => {
        const monthViews = pageViews.filter((view: any) => {
          const viewDate = new Date(view.created_at);
          return viewDate.getMonth() === monthNum && viewDate.getFullYear() === year;
        }).length;
        
        const monthPages = pages?.filter((p: any) => {
          const createdDate = new Date(p.created_at);
          return createdDate.getMonth() === monthNum && createdDate.getFullYear() === year;
        }) || [];
        
        return {
          month,
          views: monthViews,
          posts: monthPages.length
        };
      });

      setMonthlyData(monthlyStats);

    } catch (error: any) {
      toast({
        title: "Error Loading Dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Complete overview of Visas.Guide performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Pages</CardDescription>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.totalPages}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats.aiGeneratedPages} AI-generated ({stats.totalPages > 0 ? Math.round((stats.aiGeneratedPages / stats.totalPages) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Views</CardDescription>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.totalViews.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Avg: {stats.totalPages > 0 ? Math.round(stats.totalViews / stats.totalPages) : 0} per page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Newsletter Subscribers</CardDescription>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.newsletterSubs}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>AI Content Generated</CardDescription>
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.aiGenerations}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">AI generations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Affiliate Clicks</CardDescription>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.affiliateClicks}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Total tracked clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Active Freelancers</CardDescription>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{stats.activeFreelancers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Content creators</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Traffic</CardTitle>
            <CardDescription>Page views over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Growth</CardTitle>
            <CardDescription>Posts published per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="posts" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
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
          {loading ? (
            <p>Loading...</p>
          ) : topPages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pages yet</p>
          ) : (
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <div key={page.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{page.title}</h4>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
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