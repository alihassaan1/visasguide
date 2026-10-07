import { useCountries } from "@/hooks/useSharedData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
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

// Broad, curated categories only — narrow/duplicate tags are mapped into these
const BROAD_CATEGORIES = [
  "Air Travel",
  "Asia",
  "Europe",
  "Middle East",
  "Digital Nomad",
  "ETIAS",
  "Immigration News",
  "News",
];

const ASIA = ["malaysia", "thailand", "japan", "china", "india", "singapore", "vietnam", "indonesia", "philippines", "korea", "asia"];
const EUROPE = ["schengen", "europe", "eu ", "germany", "france", "italy", "spain", "portugal", "greece", "poland", "romania", "bulgaria", "uk", "britain"];
const MIDDLE_EAST = ["uae", "dubai", "saudi", "qatar", "oman", "kuwait", "bahrain", "middle east"];

const matchesBroadCategory = (tags: string[] | null, category: string) => {
  if (!tags?.length) return false;
  const lower = tags.map((t) => t.toLowerCase());
  const has = (list: string[]) => lower.some((t) => list.some((k) => t.includes(k)));
  switch (category) {
    case "Asia": return has(ASIA);
    case "Europe": return has(EUROPE);
    case "Middle East": return has(MIDDLE_EAST);
    case "Air Travel": return has(["flight", "airline", "airport", "air travel"]);
    case "Digital Nomad": return has(["digital nomad", "remote work", "nomad"]);
    case "ETIAS": return has(["etias"]);
    case "Immigration News": return has(["immigration", "residency", "citizenship"]);
    case "News": return has(["news", "update", "policy"]);
    default: return false;
  }
};

const broadCategoryOf = (tags: string[] | null): string => {
  for (const c of BROAD_CATEGORIES) {
    if (matchesBroadCategory(tags, c)) return c;
  }
  return "News";
};

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const { data: newsArticles, isLoading: newsLoading } = useQuery({
    queryKey: ['news-articles', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('id, title, slug, excerpt, featured_image_url, published_at, created_at, categories, source_url')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(article => ({ ...article, type: 'news' as const }));
    }
  });

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

  // Sidebar: most read guides
  const { data: mostRead } = useQuery({
    queryKey: ['most-read-blog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pages')
        .select('id, title, slug, featured_image_url, view_count')
        .eq('is_published', true)
        .not('view_count', 'is', null)
        .order('view_count', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Sidebar: trending destinations
  const { data: sharedCountries } = useCountries();
  const trendingDestinations = (sharedCountries || [])
    .filter((c) => c.annual_tourists != null)
    .sort((a, b) => (b.annual_tourists as number) - (a.annual_tourists as number))
    .slice(0, 6);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const allContent: ContentItem[] = [...(newsArticles || []), ...(blogPosts || [])]
    .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());

  const byTab = activeTab === 'all'
    ? allContent
    : activeTab === 'blog'
      ? allContent.filter(item => item.type === 'blog')
      : allContent.filter(item => item.type === 'news');

  const filteredContent = selectedCategory
    ? byTab.filter(item => matchesBroadCategory(item.categories, selectedCategory))
    : byTab;

  const isLoading = newsLoading || blogLoading;

  const getItemLink = (item: ContentItem) =>
    item.type === 'blog' ? `/blog/${item.slug.replace(/^blog\//, '')}` : `/blog/${item.slug}`;

  const imageFor = (slug: string, url: string | null) =>
    isBrokenImageUrl(url) ? getBlogFallbackImage(slug) : url!;

  const showFeatured = !searchTerm && !selectedCategory && activeTab === 'all';
  const featured = showFeatured ? filteredContent[0] : undefined;
  const listContent = featured ? filteredContent.slice(1) : filteredContent;

  const ImageCard = ({ item, wide = false }: { item: ContentItem; wide?: boolean }) => (
    <div>
      <Link
        to={getItemLink(item)}
        className="group relative block overflow-hidden rounded-2xl"
      >
        <div className={wide ? "aspect-[21/9]" : "aspect-[3/2]"}>
          <img
            src={imageFor(item.slug, item.featured_image_url)}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = getBlogFallbackImage(item.slug); }}
          />
        </div>
        <div
          className="absolute inset-x-0 bottom-0 p-4"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)" }}
        >
          <h3
            className={`text-white font-medium overflow-hidden group-hover:underline ${wide ? "text-xl md:text-2xl" : "text-[15px] md:text-base"}`}
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
          >
            {item.title}
          </h3>
        </div>
      </Link>
      <p className="mt-2 text-[11px] md:text-xs text-muted-foreground">
        {broadCategoryOf(item.categories)} · {formatDate(item.published_at || item.created_at)}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Latest Visa News & Immigration Updates 2026 | Visas.Guide Blog"
        description="Stay informed with the latest visa policy changes, travel restrictions, immigration updates, and border news from around the world. Updated daily."
        canonical="https://visas.guide/blog"
        keywords={["visa news", "immigration updates", "travel restrictions", "visa policy changes", "border news", "travel updates 2026"]}
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
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
              <TabsTrigger value="news">News Articles</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => { setSelectedCategory(null); setPage(1); }}
            >
              All Categories
            </Button>
            {BROAD_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedCategory(category); setPage(1); }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8">
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/2] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredContent.length > 0 ? (
              <>
                {featured && (
                  <div className="mb-6">
                    <ImageCard item={featured} wide />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listContent.slice(0, page * ITEMS_PER_PAGE).map((item) => (
                    <ImageCard key={item.id} item={item} />
                  ))}
                </div>

                {listContent.length > page * ITEMS_PER_PAGE && (
                  <div className="flex justify-center mt-8">
                    <Button variant="outline" size="lg" onClick={() => setPage(p => p + 1)}>
                      Load More ({listContent.length - page * ITEMS_PER_PAGE} remaining)
                    </Button>
                  </div>
                )}

                <div className="my-8">
                  <AffiliateBannerContainer position="horizontal-banner" />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No content found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search terms or check back later for new updates.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Most read guides
              </h2>
              <ol className="space-y-4">
                {(mostRead || []).map((post, index) => (
                  <li key={post.id}>
                    <Link
                      to={post.slug.startsWith('blog/') ? `/${post.slug}` : `/${post.slug}`}
                      className="flex items-start gap-3 group"
                    >
                      <span className="text-sm font-semibold text-muted-foreground w-4 shrink-0">{index + 1}</span>
                      <img
                        src={imageFor(post.slug, post.featured_image_url)}
                        alt={post.title}
                        className="h-10 w-10 rounded-md object-cover shrink-0"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = getBlogFallbackImage(post.slug); }}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm leading-snug line-clamp-2 group-hover:underline">
                          {post.title}
                        </span>
                        <span className="block text-[11px] text-muted-foreground mt-0.5">
                          {(post.view_count || 0).toLocaleString()} views
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Trending destinations
              </h2>
              <ul className="space-y-2">
                {(trendingDestinations || []).map((country) => (
                  <li key={country.id}>
                    <Link
                      to={`/countries/${country.slug}`}
                      className="text-sm text-foreground hover:text-primary hover:underline"
                    >
                      {country.flag_emoji ? `${country.flag_emoji} ` : ""}{country.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsPage;
