import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FreelancerDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [myPages, setMyPages] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, views: 0, aiGenerated: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load my pages
      const { data: pages, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyPages(pages || []);

      // Calculate stats
      const totalViews = pages?.reduce((sum, page) => sum + (page.view_count || 0), 0) || 0;
      const published = pages?.filter(p => p.is_published).length || 0;
      const aiGenerated = pages?.filter(p => p.ai_generated).length || 0;

      setStats({
        total: pages?.length || 0,
        published,
        views: totalViews,
        aiGenerated
      });
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

  const getTopPost = () => {
    if (myPages.length === 0) return null;
    return myPages.reduce((max, page) => 
      (page.view_count || 0) > (max.view_count || 0) ? page : max
    , myPages[0]);
  };

  const topPost = getTopPost();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Track your content performance and create new guides</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Pages</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{stats.published} published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-3xl">{stats.views.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Avg: {stats.total > 0 ? Math.round(stats.views / stats.total) : 0} per page
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>AI Generated</CardDescription>
            <CardTitle className="text-3xl">{stats.aiGenerated}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.aiGenerated / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Top Post</CardDescription>
            <CardTitle className="text-xl truncate">{topPost?.title || 'N/A'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {topPost?.view_count || 0} views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/admin/ai-studio')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>AI Content Studio</CardTitle>
                <CardDescription>Generate new content with AI assistance</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/admin/performance')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>View detailed analytics for your content</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* My Pages */}
      <Card>
        <CardHeader>
          <CardTitle>My Pages</CardTitle>
          <CardDescription>Manage your published and draft content</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : myPages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't created any pages yet</p>
              <Button onClick={() => navigate('/admin/ai-studio')}>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your First Page
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{page.title}</h3>
                      {page.ai_generated && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI
                        </Badge>
                      )}
                      <Badge variant={page.is_published ? "default" : "outline"}>
                        {page.status || (page.is_published ? 'Published' : 'Draft')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {page.view_count || 0} views
                      </span>
                      <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => window.open(`/${page.slug}`, '_blank')}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}