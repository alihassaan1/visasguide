import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, 
  Play, Trash2, Eye, ExternalLink, Image, FileText,
  Loader2, RotateCcw
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface QueueItem {
  id: string;
  rss_feed_id: string;
  original_url: string;
  original_title: string;
  original_content: string | null;
  original_image_url: string | null;
  source_name: string | null;
  status: string;
  rewritten_title: string | null;
  rewritten_content: string | null;
  generated_image_url: string | null;
  excerpt: string | null;
  extracted_tags: string[] | null;
  error_message: string | null;
  retry_count: number;
  news_article_id: string | null;
  created_at: string;
  processed_at: string | null;
  published_at: string | null;
  rss_feeds?: { name: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500", icon: Loader2 },
  rewriting: { label: "Rewriting", color: "bg-purple-500", icon: FileText },
  generating_image: { label: "Generating Image", color: "bg-indigo-500", icon: Image },
  published: { label: "Published", color: "bg-green-500", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-red-500", icon: XCircle },
  duplicate: { label: "Duplicate", color: "bg-gray-500", icon: AlertCircle },
  rejected: { label: "Rejected", color: "bg-orange-500", icon: XCircle },
};

export default function RSSMonitoringDashboard() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("queue");

  // Fetch queue items
  const { data: queueItems, isLoading: queueLoading } = useQuery({
    queryKey: ["rss-queue", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("rss_article_queue")
        .select("*, rss_feeds(name)")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as QueueItem[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["rss-queue-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rss_article_queue")
        .select("status");
      if (error) throw error;
      
      const counts = data.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        pending: counts.pending || 0,
        processing: (counts.processing || 0) + (counts.rewriting || 0) + (counts.generating_image || 0),
        published: counts.published || 0,
        failed: counts.failed || 0,
        total: data.length,
      };
    },
    refetchInterval: 10000,
  });

  // Process queue mutation
  const processMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("rss-content-processor", {});
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rss-queue"] });
      queryClient.invalidateQueries({ queryKey: ["rss-queue-stats"] });
      toast.success(`Processed ${data?.processed || 0} articles`);
    },
    onError: (error) => {
      toast.error("Processing failed: " + error.message);
    },
  });

  // Retry failed mutation
  const retryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rss_article_queue")
        .update({ status: "pending", error_message: null, retry_count: 0 })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-queue"] });
      toast.success("Article queued for retry");
    },
    onError: (error) => {
      toast.error("Failed to retry: " + error.message);
    },
  });

  // Delete queue item
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rss_article_queue").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-queue"] });
      queryClient.invalidateQueries({ queryKey: ["rss-queue-stats"] });
      toast.success("Item removed from queue");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className={`h-3 w-3 mr-1 ${status === "processing" ? "animate-spin" : ""}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RSS Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the RSS content processing pipeline</p>
        </div>
        <Button onClick={() => processMutation.mutate()} disabled={processMutation.isPending}>
          {processMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Process Queue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.processing || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.published || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Article Queue</CardTitle>
              <CardDescription>Articles being processed through the pipeline</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="rewriting">Rewriting</SelectItem>
                <SelectItem value="generating_image">Generating Image</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {queueLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Loading queue...</p>
            </div>
          ) : queueItems?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No articles in queue</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Article</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium line-clamp-2">
                            {item.rewritten_title || item.original_title}
                          </span>
                          {item.rewritten_title && item.rewritten_title !== item.original_title && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              Original: {item.original_title}
                            </span>
                          )}
                          <a
                            href={item.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 w-fit"
                          >
                            View original <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.rss_feeds?.name || item.source_name || "Unknown"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(item.status)}
                          {item.error_message && (
                            <span className="text-xs text-destructive line-clamp-2" title={item.error_message}>
                              {item.error_message.substring(0, 50)}...
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm" title={format(new Date(item.created_at), "PPpp")}>
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.retry_count}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {item.status === "published" && item.news_article_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={`/blog/${item.news_article_id}`} target="_blank">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {item.status === "failed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => retryMutation.mutate(item.id)}
                              disabled={retryMutation.isPending}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Remove this item from queue?")) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
