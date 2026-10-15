import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/lib/router-compat";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { getBlogFallbackImage, isBrokenImageUrl } from "@/lib/blogImageMap";

const LatestBlogPosts = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["latest-blog-and-guides"],
    queryFn: async () => {
      // Fetch news articles
      const { data: newsData, error: newsError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("status", "published")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(10);

      if (newsError) throw newsError;

      // Fetch country guides from content_pages
      const { data: guidesData, error: guidesError } = await supabase
        .from("content_pages")
        .select("*")
        .eq("is_published", true)
        .like("slug", "countries/%")
        .order("created_at", { ascending: false })
        .limit(10);

      if (guidesError) throw guidesError;

      // Combine and sort by date
      const newsArticles = (newsData || []).map(article => ({
        ...article,
        type: 'news' as const,
        date: new Date(article.published_at!)
      }));

      const countryGuides = (guidesData || []).map(guide => ({
        ...guide,
        type: 'guide' as const,
        date: new Date(guide.created_at)
      }));

      const combined = [...newsArticles, ...countryGuides]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 3);

      return combined;
    },
  });

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Latest Updates & Guides
          </h2>
          <p className="text-lg text-muted-foreground">Stay informed with visa news, country guides, and travel updates</p>
        </div>
        {!isLoading && posts && posts.length > 0 && (
          <Link 
            to="/blog" 
            className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden h-full">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardContent className="p-6 space-y-3">
                <div className="h-4 bg-muted rounded-sm animate-pulse w-1/3" />
                <div className="h-6 bg-muted rounded-sm animate-pulse" />
                <div className="h-4 bg-muted rounded-sm animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !posts || posts.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground text-lg">No blog posts available yet. Check back soon!</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                to={post.type === 'news' ? `/blog/${post.slug}` : `/${post.slug}`} 
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 h-full border-border/50 hover:border-primary/50 bg-card">
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <img
                      src={isBrokenImageUrl(post.featured_image_url) ? getBlogFallbackImage(post.slug || '') : post.featured_image_url!}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getBlogFallbackImage(post.slug || '');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(post.date, "MMM dd, yyyy")}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 text-primary font-medium pt-2 group-hover:gap-3 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Link 
            to="/blog" 
            className="sm:hidden flex items-center justify-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold mt-8 group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </>
      )}
    </section>
  );
};

export default LatestBlogPosts;
