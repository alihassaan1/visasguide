import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Settings, Rss, Newspaper, Key } from 'lucide-react';

interface AdminSettings {
  openai_api_key?: string;
  rss_fetch_enabled: boolean;
  auto_content_generation: boolean;
  fetch_interval_hours: number;
}

export default function Admin() {
  const [settings, setSettings] = useState<AdminSettings>({
    rss_fetch_enabled: true,
    auto_content_generation: false,
    fetch_interval_hours: 6
  });
  const [articles, setArticles] = useState([]);
  const [rssFeeds, setRssFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRssFeed, setNewRssFeed] = useState({ name: '', url: '', category: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadArticles();
    loadRssFeeds();
    loadSettings();
  }, []);

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

  const fetchRssContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rss-fetcher');
      
      if (error) throw error;

      toast({
        title: "RSS fetch started",
        description: "RSS feeds are being processed. This may take a few minutes.",
      });
      
      // Reload articles after a short delay
      setTimeout(() => {
        loadArticles();
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch RSS content. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your visa guide content and settings</p>
          </div>

          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings size={16} />
                Settings
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <Newspaper size={16} />
                Articles
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

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Generation Settings</CardTitle>
                  <CardDescription>
                    Configure how your content is automatically generated and updated
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable RSS Fetching</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically fetch content from RSS feeds
                      </p>
                    </div>
                    <Switch
                      checked={settings.rss_fetch_enabled}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, rss_fetch_enabled: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Content Generation</Label>
                      <p className="text-sm text-muted-foreground">
                        Use AI to enhance and rewrite fetched content
                      </p>
                    </div>
                    <Switch
                      checked={settings.auto_content_generation}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, auto_content_generation: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="fetch-interval">Fetch Interval (hours)</Label>
                    <Input
                      id="fetch-interval"
                      type="number"
                      min="1"
                      max="168"
                      value={settings.fetch_interval_hours}
                      onChange={(e) =>
                        setSettings(prev => ({ 
                          ...prev, 
                          fetch_interval_hours: parseInt(e.target.value) || 6 
                        }))
                      }
                      className="max-w-xs"
                    />
                    <p className="text-sm text-muted-foreground">
                      How often to check RSS feeds for new content
                    </p>
                  </div>

                  <Button onClick={saveSettings} disabled={loading}>
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
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
                  <Button onClick={fetchRssContent} disabled={loading}>
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Rss className="mr-2 h-4 w-4" />}
                    Fetch RSS Now
                  </Button>
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
      <Footer />
    </div>
  );
}