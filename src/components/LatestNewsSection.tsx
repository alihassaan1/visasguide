import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";

const LatestNewsSection = () => {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['latest-news-home'],
    queryFn: async () => {
      const { data } = await supabase
        .from('news_articles')
        .select(`
          id, title, slug, excerpt, featured_image_url, published_at, categories,
          writer:authors(name, slug)
        `)
        .not('published_at', 'is', null)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4);
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Visa News</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no news articles
  if (!articles?.length) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Latest Visa News</h2>
            <p className="text-muted-foreground mt-1">
              Stay updated with the latest visa policy changes
            </p>
          </div>
          <Link 
            to="/blog" 
            className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
          >
            All News <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/blog/${article.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group rounded-2xl">
                <div className="overflow-hidden h-40 rounded-t-2xl">
                  {article.featured_image_url ? (
                    <img 
                      src={article.featured_image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">Visa News</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  {article.categories && article.categories.length > 0 && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {article.categories[0]}
                    </Badge>
                  )}
                  <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {article.published_at && getTimeAgo(article.published_at)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNewsSection;
