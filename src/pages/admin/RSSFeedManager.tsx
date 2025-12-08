import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RefreshCw, Rss, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string | null;
  is_active: boolean;
  last_fetched: string | null;
  fetch_interval_minutes: number;
  auto_publish: boolean;
  articles_fetched: number;
  last_error: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "visa_news", label: "Visa News" },
  { value: "immigration_policies", label: "Immigration Policies" },
  { value: "travel_regulations", label: "Travel Regulations" },
  { value: "embassy_updates", label: "Embassy Updates" },
  { value: "general", label: "General" },
];

const FETCH_INTERVALS = [
  { value: 5, label: "Every 5 minutes" },
  { value: 10, label: "Every 10 minutes" },
  { value: 15, label: "Every 15 minutes" },
  { value: 30, label: "Every 30 minutes" },
  { value: 60, label: "Every hour" },
];

export default function RSSFeedManager() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<RSSFeed | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "general",
    fetch_interval_minutes: 10,
    auto_publish: true,
    is_active: true,
  });

  const { data: feeds, isLoading } = useQuery({
    queryKey: ["rss-feeds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rss_feeds")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RSSFeed[];
    },
  });

  const addFeedMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("rss_feeds").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("RSS feed added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add feed: " + error.message);
    },
  });

  const updateFeedMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase.from("rss_feeds").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      setEditingFeed(null);
      resetForm();
      toast.success("RSS feed updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update feed: " + error.message);
    },
  });

  const deleteFeedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rss_feeds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      toast.success("RSS feed deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete feed: " + error.message);
    },
  });

  const [fetchingFeedId, setFetchingFeedId] = useState<string | null>(null);
  
  const fetchFeedMutation = useMutation({
    mutationFn: async (feedId?: string) => {
      setFetchingFeedId(feedId || "all");
      const { data, error } = await supabase.functions.invoke("rss-fetcher", {
        body: feedId ? { feedId } : {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rss-feeds"] });
      queryClient.invalidateQueries({ queryKey: ["rss-queue"] });
      toast.success(`Fetched ${data?.added || 0} new articles`);
      setFetchingFeedId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to fetch: " + error.message);
      setFetchingFeedId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      category: "general",
      fetch_interval_minutes: 10,
      auto_publish: true,
      is_active: true,
    });
  };

  const handleEdit = (feed: RSSFeed) => {
    setEditingFeed(feed);
    setFormData({
      name: feed.name,
      url: feed.url,
      category: feed.category || "general",
      fetch_interval_minutes: feed.fetch_interval_minutes || 10,
      auto_publish: feed.auto_publish ?? true,
      is_active: feed.is_active,
    });
  };

  const handleSubmit = () => {
    if (editingFeed) {
      updateFeedMutation.mutate({ id: editingFeed.id, data: formData });
    } else {
      addFeedMutation.mutate(formData);
    }
  };

  const getCategoryLabel = (value: string | null) => {
    return CATEGORIES.find((c) => c.value === value)?.label || value || "General";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RSS Feed Manager</h1>
          <p className="text-muted-foreground">Manage RSS feed sources for automated content</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchFeedMutation.mutate(undefined)}
            disabled={fetchingFeedId === "all"}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${fetchingFeedId === "all" ? "animate-spin" : ""}`} />
            Fetch All Feeds
          </Button>
          <Dialog open={isAddDialogOpen || !!editingFeed} onOpenChange={(open: boolean) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingFeed(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Feed
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingFeed ? "Edit RSS Feed" : "Add RSS Feed"}</DialogTitle>
                <DialogDescription>
                  {editingFeed ? "Update the RSS feed details" : "Add a new RSS feed source for content"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Feed Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Schengen Visa News"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Feed URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/rss"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Fetch Interval</Label>
                  <Select
                    value={formData.fetch_interval_minutes.toString()}
                    onValueChange={(value) => setFormData({ ...formData, fetch_interval_minutes: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FETCH_INTERVALS.map((int) => (
                        <SelectItem key={int.value} value={int.value.toString()}>
                          {int.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_publish">Auto-publish articles</Label>
                  <Switch
                    id="auto_publish"
                    checked={formData.auto_publish}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_publish: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Feed Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingFeed(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.name || !formData.url}>
                  {editingFeed ? "Update Feed" : "Add Feed"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feeds?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {feeds?.filter((f) => f.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Articles Fetched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feeds?.reduce((sum, f) => sum + (f.articles_fetched || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Feeds with Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {feeds?.filter((f) => f.last_error).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feeds Table */}
      <Card>
        <CardHeader>
          <CardTitle>RSS Feeds</CardTitle>
          <CardDescription>Manage your RSS feed sources</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading feeds...</div>
          ) : feeds?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Rss className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No RSS feeds configured yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first feed
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feed</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Last Fetched</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeds?.map((feed) => (
                  <TableRow key={feed.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{feed.name}</span>
                        <a
                          href={feed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          {feed.url.substring(0, 40)}...
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getCategoryLabel(feed.category)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {feed.fetch_interval_minutes || 10}m
                      </div>
                    </TableCell>
                    <TableCell>
                      {feed.last_fetched ? (
                        <span className="text-sm" title={format(new Date(feed.last_fetched), "PPpp")}>
                          {formatDistanceToNow(new Date(feed.last_fetched), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{feed.articles_fetched || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {feed.is_active ? (
                          <Badge variant="default" className="bg-green-600 w-fit">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">
                            Inactive
                          </Badge>
                        )}
                        {feed.last_error && (
                          <Badge variant="destructive" className="w-fit text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => fetchFeedMutation.mutate(feed.id)}
                          disabled={fetchingFeedId === feed.id}
                        >
                          <RefreshCw className={`h-4 w-4 ${fetchingFeedId === feed.id ? "animate-spin" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(feed)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Delete this feed?")) {
                              deleteFeedMutation.mutate(feed.id);
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
