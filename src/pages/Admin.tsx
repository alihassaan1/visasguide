import type { Tables } from "@/integrations/supabase/types";
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-compat';
import Header from '@/components/Header';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Settings, Rss, Newspaper, Key, FileText, Plus, Edit, Eye, Trash2, LogOut, Loader2, Database } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';

// Content Pages Manager Component
const ContentPagesManager = ({ onEdit }: { onEdit: (page: any) => void }) => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_pages')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Page unpublished" : "Page published",
        description: "The page status has been updated successfully.",
      });
      
      loadPages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update page status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Page deleted successfully." });
      loadPages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Evergreen Content Pages</CardTitle>
          <CardDescription>
            Manage SEO-optimized content pages for popular visa searches
          </CardDescription>
        </div>
        <Button onClick={() => onEdit(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Page
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{page.title}</h3>
                    <Badge variant={page.is_published ? "default" : "secondary"}>
                      {page.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{page.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      /{page.slug}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {page.view_count || 0} views
                    </span>
                    {page.keywords && (
                      <span className="flex items-center gap-1 flex-wrap">
                        {page.keywords.slice(0, 3).map((keyword: string) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/${page.slug}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(page)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={page.is_published ? "secondary" : "default"}
                    onClick={() => togglePublish(page.id, page.is_published)}
                    disabled={loading}
                  >
                    {page.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(page.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface AdminSettings {
  openai_api_key?: string;
  rss_fetch_enabled: boolean;
  auto_content_generation: boolean;
  fetch_interval_hours: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [settings, setSettings] = useState<AdminSettings>({
    rss_fetch_enabled: true,
    auto_content_generation: false,
    fetch_interval_hours: 6
  });
  const [articles, setArticles] = useState<Tables<"news_articles">[]>([]);
  const [rssFeeds, setRssFeeds] = useState<Tables<"rss_feeds">[]>([]);
  const [contentPages, setContentPages] = useState<Tables<"content_pages">[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRssFeed, setNewRssFeed] = useState({ name: '', url: '', category: '' });
  const [editingPage, setEditingPage] = useState<any>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    content: '',
    excerpt: '',
    keywords: '',
    featured_image_url: '',
    is_published: false
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/auth');
        return;
      }

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (error || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      loadArticles();
      loadRssFeeds();
      loadSettings();
      loadContentPages();
    } catch (error) {
      navigate('/admin/auth');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/auth');
  };

  const loadSettings = async () => {
    // In a real app, you'd load these from a settings table
    // For now, we'll use localStorage as a temporary solution
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      toast({
        title: "Settings saved",
        description: "Your admin settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  };

  const loadRssFeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRssFeeds(data || []);
    } catch (error) {
      console.error('Error loading RSS feeds:', error);
    }
  };

  const addRssFeed = async () => {
    if (!newRssFeed.name || !newRssFeed.url) {
      toast({
        title: "Error",
        description: "Please provide both name and URL for the RSS feed.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('rss_feeds')
        .insert([newRssFeed]);

      if (error) throw error;

      toast({
        title: "RSS Feed added",
        description: "The RSS feed has been added successfully.",
      });
      
      setNewRssFeed({ name: '', url: '', category: '' });
      loadRssFeeds();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add RSS feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContentPages = async () => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentPages(data || []);
    } catch (error) {
      console.error('Error loading content pages:', error);
    }
  };

  const handlePageSubmit = async () => {
    if (!pageForm.title || !pageForm.slug || !pageForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const pageData = {
        title: pageForm.title,
        slug: pageForm.slug,
        meta_title: pageForm.meta_title,
        meta_description: pageForm.meta_description,
        content: pageForm.content,
        excerpt: pageForm.excerpt,
        featured_image_url: pageForm.featured_image_url,
        keywords: pageForm.keywords.split(',').map(k => k.trim()).filter(k => k),
        is_published: pageForm.is_published
      };

      if (editingPage) {
        const { error } = await supabase
          .from('content_pages')
          .update(pageData)
          .eq('id', editingPage.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Page updated successfully." });
      } else {
        const { error } = await supabase
          .from('content_pages')
          .insert([pageData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Page created successfully." });
      }

      setShowPageForm(false);
      setEditingPage(null);
      setPageForm({
        title: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        content: '',
        excerpt: '',
        keywords: '',
        featured_image_url: '',
        is_published: false
      });
      loadContentPages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPage = (page: any) => {
    if (page) {
      setEditingPage(page);
      setPageForm({
        title: page.title,
        slug: page.slug,
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        content: page.content,
        excerpt: page.excerpt || '',
        keywords: (page.keywords || []).join(', '),
        featured_image_url: page.featured_image_url || '',
        is_published: page.is_published
      });
    } else {
      setEditingPage(null);
      setPageForm({
        title: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        content: '',
        excerpt: '',
        keywords: '',
        featured_image_url: '',
        is_published: false
      });
    }
    setShowPageForm(true);
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Page deleted successfully." });
      loadContentPages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">Manage your visa guide content and settings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/admin/data')}>
                <Database className="mr-2 h-4 w-4" />
                Data Manager
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Newspaper size={16} />
                Content Pages
              </TabsTrigger>
              <TabsTrigger value="site-settings" className="flex items-center gap-2">
                <Settings size={16} />
                Site Settings
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <Newspaper size={16} />
                News
              </TabsTrigger>
              <TabsTrigger value="rss" className="flex items-center gap-2">
                <Rss size={16} />
                RSS Feeds
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Key size={16} />
                API Keys
              </TabsTrigger>
            </TabsList>

            <TabsContent value="site-settings" className="space-y-6">
              <SiteSettingsManager />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <ContentPagesManager onEdit={handleEditPage} />

              <Dialog open={showPageForm} onOpenChange={setShowPageForm}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPage ? 'Edit' : 'Create'} Content Page</DialogTitle>
                    <DialogDescription>
                      Create SEO-optimized evergreen content for visa guides
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={pageForm.title}
                          onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                          placeholder="e.g., Schengen Visa Guide 2024"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug *</Label>
                        <Input
                          id="slug"
                          value={pageForm.slug}
                          onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          placeholder="e.g., schengen-visa-guide"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                      <Input
                        id="meta_title"
                        value={pageForm.meta_title}
                        onChange={(e) => setPageForm({ ...pageForm, meta_title: e.target.value })}
                        placeholder="Max 60 characters"
                        maxLength={60}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                      <Textarea
                        id="meta_description"
                        value={pageForm.meta_description}
                        onChange={(e) => setPageForm({ ...pageForm, meta_description: e.target.value })}
                        placeholder="Max 160 characters"
                        maxLength={160}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={pageForm.excerpt}
                        onChange={(e) => setPageForm({ ...pageForm, excerpt: e.target.value })}
                        placeholder="Brief summary of the content"
                        rows={3}
                      />
                    </div>

                    <ImageUpload
                      value={pageForm.featured_image_url}
                      onChange={(url) => setPageForm({ ...pageForm, featured_image_url: url })}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="content">Content * (HTML Editor)</Label>
                      <RichTextEditor
                        value={pageForm.content}
                        onChange={(value) => setPageForm({ ...pageForm, content: value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        value={pageForm.keywords}
                        onChange={(e) => setPageForm({ ...pageForm, keywords: e.target.value })}
                        placeholder="e.g., schengen visa, europe visa, visa requirements"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_published"
                        checked={pageForm.is_published}
                        onCheckedChange={(checked) => setPageForm({ ...pageForm, is_published: checked })}
                      />
                      <Label htmlFor="is_published">Publish immediately</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowPageForm(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handlePageSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingPage ? 'Update' : 'Create'} Page
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="articles" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Articles</CardTitle>
                    <CardDescription>
                      Latest news articles in your database
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.map((article: any) => (
                      <div key={article.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold text-foreground">{article.title}</h3>
                            <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{article.source_type}</Badge>
                              {article.categories?.map((cat: string) => (
                                <Badge key={cat} variant="outline">{cat}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground ml-4">
                            {new Date(article.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rss" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add RSS Feed</CardTitle>
                  <CardDescription>
                    Add new RSS feeds to automatically import content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="feed-name">Feed Name</Label>
                      <Input
                        id="feed-name"
                        placeholder="Immigration News"
                        value={newRssFeed.name}
                        onChange={(e) => setNewRssFeed(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feed-url">RSS URL</Label>
                      <Input
                        id="feed-url"
                        placeholder="https://example.com/rss"
                        value={newRssFeed.url}
                        onChange={(e) => setNewRssFeed(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feed-category">Category</Label>
                      <Input
                        id="feed-category"
                        placeholder="Immigration News"
                        value={newRssFeed.category}
                        onChange={(e) => setNewRssFeed(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={addRssFeed} disabled={loading}>
                    Add RSS Feed
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing RSS Feeds</CardTitle>
                  <CardDescription>
                    Manage your current RSS feed sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rssFeeds.map((feed: any) => (
                      <div key={feed.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{feed.name}</h3>
                            <p className="text-sm text-muted-foreground">{feed.url}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={feed.is_active ? "default" : "secondary"}>
                              {feed.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {feed.category && <Badge variant="outline">{feed.category}</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>
                    Configure external API keys for content enhancement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="Enter your OpenAI API key"
                      value={settings.openai_api_key || ''}
                      onChange={(e) =>
                        setSettings(prev => ({ ...prev, openai_api_key: e.target.value }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Required for AI-powered content generation and enhancement. 
                      Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a>.
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Features enabled with OpenAI API:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Automatic content enhancement and rewriting</li>
                      <li>• SEO optimization of articles</li>
                      <li>• Auto-generation of meta descriptions</li>
                      <li>• Content categorization and tagging</li>
                    </ul>
                  </div>

                  <Button onClick={saveSettings} disabled={loading}>
                    Save API Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
    </div>
  );
}