import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ExternalLink, Search, Newspaper, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getBlogFallbackImage, isBrokenImageUrl } from "@/lib/blogImageMap";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  categories: string[] | null;
  source_url?: string | null;
  type: 'news' | 'blog';
}

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Fetch news articles
  const { data: newsArticles, isLoading: newsLoading } = useQuery({
    queryKey: ['news-articles', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('id, title, slug, excerpt, featured_image_url, published_at, created_at, categories, source_url')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.contains('categories', [selectedCategory]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(article => ({ ...article, type: 'news' as const }));
    }
  });

  // Fetch blog posts from content_pages
  const { data: blogPosts, isLoading: blogLoading } = useQuery({
    queryKey: ['blog-posts', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('content_pages')
        .select('id, title, slug, excerpt, featured_image_url, created_at, keywords')
        .like('slug', 'blog/%')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(post => ({ 
        ...post, 
        published_at: post.created_at,
        categories: post.keywords,
        source_url: null,
        type: 'blog' as const 
      }));
    }
  });

  const { data: featuredArticles } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_featured', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch actual categories from database
  const { data: dbCategories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data: newsData } = await supabase
        .from('news_articles')
        .select('categories')
        .not('published_at', 'is', null)
        .not('categories', 'is', null);
      
      const { data: blogData } = await supabase
        .from('content_pages')
        .select('keywords')
        .like('slug', 'blog/%')
        .eq('is_published', true)
        .not('keywords', 'is', null);

      const catSet = new Set<string>();
      (newsData || []).forEach(a => (a.categories || []).forEach((c: string) => catSet.add(c)));
      (blogData || []).forEach(p => (p.keywords || []).forEach((k: string) => catSet.add(k)));
      return Array.from(catSet).sort().slice(0, 12);
    }
  });

  const categories = dbCategories || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Combine and sort all content
  const allContent: ContentItem[] = [...(newsArticles || []), ...(blogPosts || [])]
    .sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      return dateB - dateA;
    });

  const filteredContent = activeTab === 'all' 
    ? allContent 
    : activeTab === 'blog' 
      ? allContent.filter(item => item.type === 'blog')
      : allContent.filter(item => item.type === 'news');

  const isLoading = newsLoading || blogLoading;

  const getItemLink = (item: ContentItem) => {
    if (item.type === 'blog') {
      // Remove 'blog/' prefix from slug for blog posts
      const cleanSlug = item.slug.replace(/^blog\//, '');
      return `/blog/${cleanSlug}`;
    }
    return `/blog/${item.slug}`;
  };

  const renderContentCard = (item: ContentItem) => (
    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="aspect-video bg-muted overflow-hidden">
        <img 
          src={isBrokenImageUrl(item.featured_image_url) ? getBlogFallbackImage(item.slug) : item.featured_image_url!}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getBlogFallbackImage(item.slug);
          }}
        />
      </div>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={item.type === 'blog' ? 'default' : 'secondary'}>
            {item.type === 'blog' ? (
              <><FileText className="h-3 w-3 mr-1" /> Blog</>
            ) : (
              <><Newspaper className="h-3 w-3 mr-1" /> News</>
            )}
          </Badge>
          {item.categories && item.categories[0] && (
            <Badge variant="outline">{item.categories[0]}</Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2">
          <Link 
            to={getItemLink(item)}
            className="hover:text-primary transition-colors"
          >
            {item.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {item.excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(item.published_at || item.created_at)}
          </div>
          {item.source_url && (
            <a 
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary"
            >
              <ExternalLink className="h-3 w-3" />
              Source
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Latest Visa News & Immigration Updates 2026 | Visas.Guide Blog"
        description="Stay informed with the latest visa policy changes, travel restrictions, immigration updates, and border news from around the world. Updated daily."
        canonical="https://visas.guide/blog"
        keywords={["visa news", "immigration updates", "travel restrictions", "visa policy changes", "border news", "travel updates 2026"]}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Latest Visa & Travel News - Visas Guide",
            "description": "Stay updated with the latest visa requirements, travel restrictions, and immigration news from around the world. Real-time updates on visa policy changes.",
            "url": "https://visas.guide/blog",
            "mainEntity": {
              "@type": "Blog",
              "name": "Visa & Travel News",
              "description": "Latest updates on visa requirements and travel policies worldwide"
            }
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Latest Visa & Travel News</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Stay informed with real-time updates on visa requirements, travel restrictions, and immigration policies worldwide.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="blog">
                <FileText className="h-4 w-4 mr-1" />
                Blog Posts
              </TabsTrigger>
              <TabsTrigger value="news">
                <Newspaper className="h-4 w-4 mr-1" />
                News Articles
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Articles - only show on All tab without filters */}
        {featuredArticles && featuredArticles.length > 0 && !searchTerm && !selectedCategory && activeTab === 'all' && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted overflow-hidden">
                      <img 
                        src={isBrokenImageUrl(article.featured_image_url) ? getBlogFallbackImage(article.slug) : article.featured_image_url!}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getBlogFallbackImage(article.slug);
                        }}
                      />
                    </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">Featured</Badge>
                      {article.categories && article.categories[0] && (
                        <Badge variant="secondary">{article.categories[0]}</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">
                      <Link 
                        to={`/blog/${article.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(article.published_at!)}
                      </div>
                      {article.source_url && (
                        <a 
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Source
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Horizontal Banner */}
        <div className="my-8">
          <AffiliateBannerContainer position="horizontal-banner" />
        </div>

        {/* All Content */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {searchTerm || selectedCategory 
              ? 'Search Results' 
              : activeTab === 'blog' 
                ? 'Latest Blog Posts' 
                : activeTab === 'news' 
                  ? 'Latest News' 
                  : 'Latest Content'}
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <CardHeader>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredContent && filteredContent.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.slice(0, page * ITEMS_PER_PAGE).map(renderContentCard)}
              </div>
              {filteredContent.length > page * ITEMS_PER_PAGE && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" size="lg" onClick={() => setPage(p => p + 1)}>
                    Load More ({filteredContent.length - page * ITEMS_PER_PAGE} remaining)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No content found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search terms or check back later for new updates.
              </p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default NewsPage;
