import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2,
  TrendingUp,
  MousePointer,
  Eye,
  Heart,
  RefreshCw,
  Facebook,
  Instagram,
  Linkedin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SocialMediaDashboard() {
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch social posts summary
  const { data: postsData, refetch: refetchPosts } = useQuery({
    queryKey: ['social-posts-summary'],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      
      const { data: allPosts, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const posts = allPosts || [];
      const recentPosts = posts.filter(p => new Date(p.created_at) >= thirtyDaysAgo);

      return {
        total: posts.length,
        thisMonth: recentPosts.length,
        published: posts.filter(p => p.status === 'published').length,
        pending: posts.filter(p => p.status === 'pending' || p.status === 'queued').length,
        failed: posts.filter(p => p.status === 'failed').length,
        totalReach: posts.reduce((sum, p) => sum + (p.reach || 0), 0),
        totalClicks: posts.reduce((sum, p) => sum + (p.link_clicks || 0), 0),
        totalEngagement: posts.reduce((sum, p) => sum + (p.engagement_count || 0), 0),
        recentPosts: posts.slice(0, 10),
        facebookPosts: posts.filter(p => p.platform === 'facebook').length,
        instagramPosts: posts.filter(p => p.platform === 'instagram').length,
        linkedinPosts: posts.filter(p => p.platform === 'linkedin').length,
      };
    },
  });

  // Platform connection status
  const { data: platforms } = useQuery({
    queryKey: ['platform-accounts-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_accounts')
        .select('platform, account_name, access_token_encrypted, token_expires_at, is_active');
      if (error) throw error;
      return (data || []).map((p: any) => ({
        platform: p.platform,
        accountName: p.account_name,
        isActive: p.is_active,
        isConnected:
          !!p.access_token_encrypted &&
          p.access_token_encrypted.length > 0 &&
          !/not connected/i.test(p.account_name || '') &&
          (!p.token_expires_at || new Date(p.token_expires_at) > new Date()),
        tokenExpiresAt: p.token_expires_at,
      }));
    },
  });

  // Fetch content events queue — total count + preview list
  const { data: eventsData, refetch: refetchEvents } = useQuery({
    queryKey: ['content-events-queue'],
    queryFn: async () => {
      const [{ count: totalUnprocessed }, { data: preview, error }] = await Promise.all([
        supabase
          .from('content_events')
          .select('*', { count: 'exact', head: true })
          .eq('processed', false),
        supabase
          .from('content_events')
          .select('*')
          .eq('processed', false)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);
      if (error) throw error;
      return { totalUnprocessed: totalUnprocessed ?? 0, preview: preview || [] };
    },
  });

  // Fetch marketing clicks
  const { data: clicksData } = useQuery({
    queryKey: ['marketing-clicks-summary'],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

      const { data, error } = await supabase
        .from('marketing_clicks')
        .select('utm_source, clicked_at')
        .gte('clicked_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      const clicks = data || [];
      return {
        total: clicks.length,
        facebook: clicks.filter(c => c.utm_source === 'facebook').length,
        instagram: clicks.filter(c => c.utm_source === 'instagram').length,
        linkedin: clicks.filter(c => c.utm_source === 'linkedin').length,
      };
    },
  });

  // Fetch top performing content
  const { data: topContent } = useQuery({
    queryKey: ['top-social-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          id,
          platform,
          content_type,
          caption,
          tracked_url,
          reach,
          link_clicks,
          engagement_count,
          published_at,
          content_page_id,
          news_article_id
        `)
        .eq('status', 'published')
        .order('link_clicks', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('social-content-publisher', {
        body: { batchSize: 10, forceProcess: true },
      });

      if (error) throw error;

      toast.success(`Processed ${data.processed} content events`);
      refetchPosts();
      refetchEvents();
    } catch (error: any) {
      toast.error('Failed to process queue: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Published</Badge>;
      case 'pending':
      case 'queued':
        return <Badge className="bg-yellow-500/20 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? (
      <Facebook className="h-4 w-4 text-blue-600" />
    ) : (
      <Instagram className="h-4 w-4 text-pink-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Social Media Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your social media automation</p>
        </div>
        <Button onClick={handleProcessQueue} disabled={isProcessing}>
          {isProcessing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Process Queue
        </Button>
      </div>

      {/* Diagnostics — surface real automation health */}
      {(() => {
        const connectedCount = platforms?.filter(p => p.isConnected).length ?? 0;
        const totalAccounts = platforms?.length ?? 0;
        const unprocessed = eventsData?.totalUnprocessed ?? 0;
        const messages: { tone: 'error' | 'warn'; text: string }[] = [];
        if (platforms && connectedCount === 0) {
          messages.push({
            tone: 'error',
            text: `No platform accounts are connected (${totalAccounts} configured). Posts cannot publish until you connect Facebook, Instagram, or LinkedIn under Marketing → Platforms.`,
          });
        }
        if (unprocessed > 100) {
          messages.push({
            tone: 'warn',
            text: `${unprocessed.toLocaleString()} content events are unprocessed. No cron is invoking social-content-publisher — run "Process Queue" manually or schedule it.`,
          });
        }
        if (!messages.length) return null;
        return (
          <div className="space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm ${
                  m.tone === 'error'
                    ? 'border-destructive/40 bg-destructive/10 text-foreground'
                    : 'border-yellow-500/40 bg-yellow-500/10 text-foreground'
                }`}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Platform connection status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Platform Connections</CardTitle>
          <CardDescription>OAuth status of every configured social account</CardDescription>
        </CardHeader>
        <CardContent>
          {platforms?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {platforms.map((p) => {
                const Icon =
                  p.platform === 'facebook' ? Facebook
                    : p.platform === 'instagram' ? Instagram
                    : p.platform === 'linkedin' ? Linkedin
                    : Share2;
                return (
                  <div key={`${p.platform}-${p.accountName}`} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-5 w-5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium capitalize">{p.platform}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.accountName}</p>
                      </div>
                    </div>
                    {p.isConnected ? (
                      <Badge className="bg-green-500/20 text-green-600 shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-600 shrink-0">
                        <XCircle className="h-3 w-3 mr-1" /> Not connected
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              No platform accounts configured. Add accounts under Marketing → Platforms.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{postsData?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{postsData?.thisMonth || 0}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{postsData?.totalReach?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Total Reach</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{postsData?.totalClicks?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-2xl font-bold">{postsData?.totalEngagement?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{postsData?.pending || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Facebook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{postsData?.facebookPosts || 0}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{clicksData?.facebook || 0}</p>
                <p className="text-sm text-muted-foreground">Clicks (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              Instagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{postsData?.instagramPosts || 0}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{clicksData?.instagram || 0}</p>
                <p className="text-sm text-muted-foreground">Clicks (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-sky-700" />
              LinkedIn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{postsData?.linkedinPosts || 0}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{clicksData?.linkedin || 0}</p>
                <p className="text-sm text-muted-foreground">Clicks (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent Posts</TabsTrigger>
          <TabsTrigger value="queue">Content Queue ({eventsData?.totalUnprocessed?.toLocaleString() || 0})</TabsTrigger>
          <TabsTrigger value="top">Top Performing</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Social Posts</CardTitle>
              <CardDescription>Latest posts across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postsData?.recentPosts?.length ? (
                  postsData.recentPosts.map((post: any) => (
                    <div key={post.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      {getPlatformIcon(post.platform)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {post.caption?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{format(new Date(post.created_at), 'MMM d, h:mm a')}</span>
                          <span>Clicks: {post.link_clicks || 0}</span>
                          <span>Reach: {post.reach || 0}</span>
                        </div>
                      </div>
                      {getStatusBadge(post.status)}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No social posts yet. Publish content to get started!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Events Queue</CardTitle>
              <CardDescription>
                {eventsData?.totalUnprocessed?.toLocaleString() || 0} unprocessed content events.
                Showing the {eventsData?.preview?.length || 0} most recent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventsData?.preview?.length ? (
                  eventsData.preview.map((event: any) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <Badge variant="outline" className="shrink-0">
                        {event.content_type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">/{event.slug}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(event.created_at), 'MMM d, h:mm a')} • {event.event_type}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No content events in queue
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Posts with highest engagement and clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContent?.length ? (
                  topContent.map((post: any, index: number) => (
                    <div key={post.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      {getPlatformIcon(post.platform)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {post.caption?.substring(0, 80)}...
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary">{post.content_type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {post.link_clicks || 0} clicks
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {post.reach || 0} reach
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No published posts yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}