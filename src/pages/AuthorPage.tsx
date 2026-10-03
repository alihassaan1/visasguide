import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { useAuthors } from "@/hooks/useSharedData";

const AuthorPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Author details from the shared authors cache
  const { data: allAuthors, isLoading: authorLoading } = useAuthors();
  const author = (allAuthors || []).find((a: any) => a.slug === slug && a.is_active);

  // Fetch author's content pages
  const { data: contentPages = [] } = useQuery({
    queryKey: ['author-content', author?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pages')
        .select('id, title, slug, excerpt, created_at, featured_image_url')
        .eq('writer_id', author?.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!author?.id,
  });

  // Fetch author's news articles
  const { data: newsArticles = [] } = useQuery({
    queryKey: ['author-news', author?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, slug, excerpt, created_at, featured_image_url')
        .eq('writer_id', author?.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!author?.id,
  });

  if (authorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Author Not Found</h1>
          <p className="text-muted-foreground mb-6">The author you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline">Return to Home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const allArticles = [
    ...contentPages.map(p => ({ ...p, type: 'guide' })),
    ...newsArticles.map(a => ({ ...a, type: 'blog' })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const expertise = author.expertise as string[] || [];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${author.name} - ${author.role} | Visas Guide`}
        description={author.bio || `Read travel and visa articles by ${author.name}, ${author.role} at Visas Guide.`}
        canonical={`https://visas.guide/author/${slug}`}
      />

      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Author Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="shrink-0">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-16 w-16 text-primary/50" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-1">{author.name}</h1>
                <p className="text-lg text-primary font-medium mb-3">{author.role}</p>
                
                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expertise.map((exp, i) => (
                      <Badge key={i} variant="secondary">{exp}</Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-muted-foreground leading-relaxed">{author.bio}</p>
                
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {allArticles.length} articles
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages Updated by Author */}
        <h2 className="text-2xl font-bold mb-2">Pages Updated by {author.name}</h2>
        <p className="text-muted-foreground mb-6">
          Browse all visa guides, country pages, and blog posts written and updated by {author.name}.
        </p>

        {allArticles.length === 0 ? (
          <p className="text-muted-foreground">No articles published yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                <Link to={article.type === 'blog' ? `/blog/${article.slug}` : `/${article.slug}`}>
                  {article.featured_image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.type === 'blog' ? 'Blog' : 'Guide'}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                    )}
                    <span className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AuthorPage;
