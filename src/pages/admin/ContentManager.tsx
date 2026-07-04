import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Search, PenLine, Sparkles, ChevronDown, Clock, ChevronLeft, ChevronRight, Pin, PinOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ContentManager() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [aiGeneratedCount, setAiGeneratedCount] = useState(0); // kept for compatibility
  const [totalViews, setTotalViews] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    loadPages();
    loadStats();
  }, [currentPage]);

  const loadStats = async () => {
    try {
      // Get accurate counts using count: 'exact'
      const [totalRes, publishedRes, viewsRes] = await Promise.all([
        supabase.from("content_pages").select("id", { count: "exact", head: true }),
        supabase.from("content_pages").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("content_pages").select("view_count"),
      ]);

      setTotalCount(totalRes.count || 0);
      setPublishedCount(publishedRes.count || 0);
      
      // Sum all view counts
      const views = (viewsRes.data || []).reduce((sum, p) => sum + (p.view_count || 0), 0);
      setTotalViews(views);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadPages = async () => {
    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("content_pages")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Pages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const { error } = await supabase.from("content_pages").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Page deleted successfully" });
      loadPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { data: page, error: fetchError } = await supabase
        .from("content_pages")
        .select("slug")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("content_pages")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      // Submit to IndexNow when publishing (not unpublishing)
      if (!currentStatus && page?.slug) {
        try {
          await supabase.functions.invoke('auto-indexnow', {
            body: { urls: [`/${page.slug}`] }
          });
          console.log('Submitted to IndexNow:', page.slug);
        } catch (indexError) {
          console.error('IndexNow submission failed:', indexError);
        }
      }

      toast({
        title: currentStatus ? "Page unpublished" : "Page published and submitted to search engines",
      });
      loadPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("content_pages")
        .update({
          is_featured: !currentStatus,
          featured_at: !currentStatus ? new Date().toISOString() : null,
        } as any)
        .eq("id", id);
      if (error) throw error;
      toast({ title: currentStatus ? "Unpinned from homepage" : "Pinned to homepage" });
      loadPages();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Content Manager</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage all content pages and articles</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create New Page
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/admin/manual-editor")}>
              <PenLine className="mr-2 h-4 w-4" />
              Create Manually
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/ai-content-studio")}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-xs sm:text-sm">Total Pages</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">{totalCount.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-xs sm:text-sm">Published</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">
              {publishedCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-xs sm:text-sm">Total Views</CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">
              {totalViews.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Pages</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage and edit your content pages</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm sm:text-base">Loading...</p>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">No pages found</p>
              <Button onClick={() => navigate("/admin/ai-content-studio")} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Page
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium text-xs sm:text-sm">{page.title}</TableCell>
                    <TableCell className="text-xs sm:text-sm">/{page.slug}</TableCell>
                    <TableCell>
                      {(page as any).scheduled_at && !page.is_published ? (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date((page as any).scheduled_at).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge variant={page.is_published ? "default" : "secondary"} className="text-xs">
                          {page.is_published ? "Published" : "Draft"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{page.created_by || "-"}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <Badge variant="outline" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {page.view_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(page.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/admin/manual-editor?edit=${page.id}`)}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title={(page as any).is_featured ? "Unpin from homepage" : "Pin to homepage"}
                          onClick={() => toggleFeatured(page.id, Boolean((page as any).is_featured))}
                          className={(page as any).is_featured ? "text-primary" : ""}
                        >
                          {(page as any).is_featured ? <PinOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Pin className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePublish(page.id, page.is_published)}
                          className="text-xs hidden sm:inline-flex"
                        >
                          {page.is_published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(page.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} pages
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
