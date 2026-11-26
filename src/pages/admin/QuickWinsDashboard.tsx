import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, TrendingUp, Zap, Eye, MousePointer, ArrowUp, RefreshCw, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface PageMetrics {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  impressions: number;
  clicks: number;
  ctr: number;
  avg_position: number;
  opportunity_score: number;
  issues: string[];
}

export default function QuickWinsDashboard() {
  const queryClient = useQueryClient();

  // Fetch pages with analytics data to identify quick wins
  const { data: quickWins, isLoading } = useQuery({
    queryKey: ['quick-wins-pages'],
    queryFn: async () => {
      // Get content pages with view counts
      const { data: pages, error } = await supabase
        .from('content_pages')
        .select('id, slug, title, meta_title, meta_description, view_count, updated_at')
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get analytics data for these pages
      const { data: analyticsData } = await supabase
        .from('analytics_events')
        .select('page_slug')
        .eq('event_type', 'page_view')
        .eq('is_bot', false)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Count views per page from analytics
      const viewCounts: Record<string, number> = {};
      analyticsData?.forEach(event => {
        const slug = event.page_slug || '';
        viewCounts[slug] = (viewCounts[slug] || 0) + 1;
      });

      // Analyze each page for optimization opportunities
      const analyzedPages: PageMetrics[] = (pages || []).map(page => {
        const issues: string[] = [];
        let opportunityScore = 0;

        // Check meta title
        if (!page.meta_title) {
          issues.push('Missing meta title');
          opportunityScore += 30;
        } else if (page.meta_title.length > 60) {
          issues.push('Meta title too long (>60 chars)');
          opportunityScore += 15;
        } else if (page.meta_title.length < 30) {
          issues.push('Meta title too short (<30 chars)');
          opportunityScore += 10;
        }
        if (page.meta_title && !page.meta_title.includes('2025') && !page.meta_title.includes('2026')) {
          issues.push('No year in title (freshness signal)');
          opportunityScore += 10;
        }

        // Check meta description
        if (!page.meta_description) {
          issues.push('Missing meta description');
          opportunityScore += 25;
        } else if (page.meta_description.length > 160) {
          issues.push('Meta description too long (>160 chars)');
          opportunityScore += 10;
        } else if (page.meta_description.length < 80) {
          issues.push('Meta description too short (<80 chars)');
          opportunityScore += 10;
        }
        if (page.meta_description && !page.meta_description.includes('✓') && !page.meta_description.includes('→')) {
          issues.push('No action symbols in description');
          opportunityScore += 5;
        }

        // Check slug for visa requirements pages (high value)
        if (page.slug?.includes('-to-') && page.slug?.includes('visa')) {
          opportunityScore += 20; // These are high-value pages
        }

        // Boost score for high-traffic pages (more impact from optimization)
        const recentViews = viewCounts[page.slug] || 0;
        if (recentViews > 50) opportunityScore += 15;
        if (recentViews > 100) opportunityScore += 15;

        return {
          id: page.id,
          slug: page.slug,
          title: page.title,
          meta_title: page.meta_title,
          meta_description: page.meta_description,
          view_count: page.view_count || 0,
          impressions: recentViews * 10, // Estimate
          clicks: recentViews,
          ctr: recentViews > 0 ? (recentViews / (recentViews * 10)) * 100 : 0,
          avg_position: 25, // Placeholder
          opportunity_score: Math.min(opportunityScore, 100),
          issues
        };
      });

      // Sort by opportunity score (highest first)
      return analyzedPages
        .filter(p => p.issues.length > 0)
        .sort((a, b) => b.opportunity_score - a.opportunity_score)
        .slice(0, 50);
    },
    staleTime: 5 * 60 * 1000
  });

  // Get summary stats
  const { data: summaryStats } = useQuery({
    queryKey: ['quick-wins-summary'],
    queryFn: async () => {
      const { data: totalPages } = await supabase
        .from('content_pages')
        .select('id', { count: 'exact' })
        .eq('is_published', true);

      const { data: pagesWithMeta } = await supabase
        .from('content_pages')
        .select('id', { count: 'exact' })
        .eq('is_published', true)
        .not('meta_title', 'is', null)
        .not('meta_description', 'is', null);

      const { data: recentOptimized } = await supabase
        .from('content_pages')
        .select('id', { count: 'exact' })
        .eq('is_published', true)
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const total = totalPages?.length || 0;
      const withMeta = pagesWithMeta?.length || 0;
      const recent = recentOptimized?.length || 0;

      return {
        totalPages: total,
        optimizedPages: withMeta,
        optimizationRate: total > 0 ? Math.round((withMeta / total) * 100) : 0,
        recentlyOptimized: recent
      };
    }
  });

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge variant="destructive">High Priority</Badge>;
    if (score >= 40) return <Badge className="bg-amber-500">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Quick Wins Dashboard
          </h1>
          <p className="text-muted-foreground">
            Pages with highest CTR optimization potential for Google Search
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['quick-wins-pages'] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Published Pages</CardDescription>
            <CardTitle className="text-3xl">{summaryStats?.totalPages || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Active in search</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CTR Optimization Rate</CardDescription>
            <CardTitle className="text-3xl">{summaryStats?.optimizationRate || 0}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={summaryStats?.optimizationRate || 0} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pages Needing Optimization</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{quickWins?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <span>Quick win opportunities</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recently Optimized (7d)</CardDescription>
            <CardTitle className="text-3xl text-green-500">{summaryStats?.recentlyOptimized || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span>Updated this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList>
          <TabsTrigger value="opportunities">
            <TrendingUp className="h-4 w-4 mr-2" />
            Optimization Opportunities
          </TabsTrigger>
          <TabsTrigger value="guide">
            <Zap className="h-4 w-4 mr-2" />
            CTR Best Practices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pages with Highest CTR Improvement Potential</CardTitle>
              <CardDescription>
                Ranked by opportunity score - fix these first for maximum Google Search impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Current Meta</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quickWins?.map(page => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <p className="font-medium truncate">{page.title}</p>
                          <a 
                            href={`/${page.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            /{page.slug.substring(0, 30)}...
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm truncate">
                            {page.meta_title || <span className="text-muted-foreground italic">No title</span>}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {page.meta_description?.substring(0, 50) || 'No description'}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {page.issues.slice(0, 2).map((issue, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                          {page.issues.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{page.issues.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getScoreBadge(page.opportunity_score)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          {page.view_count}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(!quickWins || quickWins.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="font-medium">All pages are optimized!</p>
                  <p className="text-sm">No immediate CTR optimization opportunities found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-green-500" />
                  Meta Title Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Do:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Keep under 60 characters</li>
                    <li>Include the year (2026) for freshness</li>
                    <li>Use power words: Complete, Ultimate, Official, Easy</li>
                    <li>Match exact search queries</li>
                    <li>Put most important keywords first</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">❌ Don't:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Use generic titles like "Home" or "Page"</li>
                    <li>Stuff keywords unnaturally</li>
                    <li>Exceed 60 characters (gets truncated)</li>
                    <li>Repeat the site name in every title</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Example:</p>
                  <p className="text-sm font-medium">India to UAE Visa Requirements 2026 | Complete Guide</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-blue-500" />
                  Meta Description Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Do:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Use 140-160 characters</li>
                    <li>Start with a question or hook</li>
                    <li>Include visual elements: ✓ → ★</li>
                    <li>Add a clear call-to-action</li>
                    <li>Mention specific benefits</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">❌ Don't:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Write vague or generic descriptions</li>
                    <li>Copy the first paragraph of content</li>
                    <li>Use all caps or excessive punctuation</li>
                    <li>Leave it empty (Google will auto-generate)</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Example:</p>
                  <p className="text-sm">Do Indians need a visa for UAE? ✓ Get 30-day visa on arrival. Check fees, processing time & requirements → Apply online now!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
