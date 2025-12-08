import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Facebook, 
  Instagram, 
  MoreVertical, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SocialPostsList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch social posts
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['social-posts', platformFilter, statusFilter, page],
    queryFn: async () => {
      let query = supabase
        .from('social_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (platformFilter !== 'all') {
        query = query.eq('platform', platformFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { posts: data || [], totalCount: count || 0 };
    },
  });

  // Retry failed post mutation
  const retryMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('social_posts')
        .update({ 
          status: 'queued', 
          error_message: null,
          retry_count: 0 
        })
        .eq('id', postId);
      
      if (error) throw error;

      // Trigger the publisher
      await supabase.functions.invoke('social-content-publisher', {
        body: { batchSize: 1, forceProcess: true },
      });
    },
    onSuccess: () => {
      toast.success('Post queued for retry');
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
    onError: (error: any) => {
      toast.error('Failed to retry post: ' + error.message);
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Post deleted');
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete post: ' + error.message);
    },
  });

  const filteredPosts = data?.posts?.filter(post => 
    search === "" || 
    post.caption?.toLowerCase().includes(search.toLowerCase()) ||
    post.content_type?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Published</Badge>;
      case 'pending':
      case 'queued':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'publishing':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Publishing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
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
          <h1 className="text-2xl font-bold text-foreground">Social Posts</h1>
          <p className="text-muted-foreground">All social media posts and their status</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({data?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Platform</TableHead>
                      <TableHead>Caption</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Reach</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post: any) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          {getPlatformIcon(post.platform)}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="truncate text-sm">{post.caption?.substring(0, 80)}...</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {post.content_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(post.status)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {post.link_clicks || 0}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {post.reach || 0}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(post.created_at), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedPost(post)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {post.tracked_url && (
                                <DropdownMenuItem onClick={() => window.open(post.tracked_url, '_blank')}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open Link
                                </DropdownMenuItem>
                              )}
                              {post.status === 'failed' && (
                                <DropdownMenuItem onClick={() => retryMutation.mutate(post.id)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Retry
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate(post.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Post Details Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPost && getPlatformIcon(selectedPost.platform)}
              Post Details
            </DialogTitle>
            <DialogDescription>
              Full details of the social media post
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">{getStatusBadge(selectedPost.status)}</div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Caption</label>
                <p className="mt-1 text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                  {selectedPost.caption}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Hashtags</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedPost.hashtags?.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary">#{tag}</Badge>
                  ))}
                </div>
              </div>

              {selectedPost.tracked_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tracked URL</label>
                  <a 
                    href={selectedPost.tracked_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-primary hover:underline block truncate"
                  >
                    {selectedPost.tracked_url}
                  </a>
                </div>
              )}

              {selectedPost.error_message && (
                <div>
                  <label className="text-sm font-medium text-red-600">Error Message</label>
                  <p className="mt-1 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {selectedPost.error_message}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reach</label>
                  <p className="text-lg font-bold">{selectedPost.reach || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Impressions</label>
                  <p className="text-lg font-bold">{selectedPost.impressions || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Clicks</label>
                  <p className="text-lg font-bold">{selectedPost.link_clicks || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Engagement</label>
                  <p className="text-lg font-bold">{selectedPost.engagement_count || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">Created</label>
                  <p>{format(new Date(selectedPost.created_at), 'PPpp')}</p>
                </div>
                {selectedPost.published_at && (
                  <div>
                    <label className="text-muted-foreground">Published</label>
                    <p>{format(new Date(selectedPost.published_at), 'PPpp')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}