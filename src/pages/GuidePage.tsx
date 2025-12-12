import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SocialShareButtons from "@/components/SocialShareButtons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, ChevronRight, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const GuidePage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: guide, isLoading, error } = useQuery({
    queryKey: ['guide', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedGuides } = useQuery({
    queryKey: ['related-guides', guide?.guide_type],
    queryFn: async () => {
      const { data } = await supabase
        .from('guides')
        .select('id, title, slug, guide_type, difficulty, read_time_minutes')
        .neq('slug', slug)
        .limit(3);
      return data || [];
    },
    enabled: !!guide,
  });

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Guide Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The guide you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/guides">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Guides
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const pageUrl = `https://visas.guide/guides/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={guide.seo_title || guide.title}
        description={guide.seo_description || guide.excerpt || `Complete guide to ${guide.title}`}
        canonical={pageUrl}
        ogType="article"
      />
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/guides" className="hover:text-primary transition-colors">Guides</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate max-w-[200px]">{guide.title}</span>
            </nav>

            <div className="max-w-4xl">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="capitalize">
                  {guide.guide_type?.replace(/-/g, ' ') || 'Guide'}
                </Badge>
                {guide.difficulty && (
                  <Badge className={getDifficultyColor(guide.difficulty)}>
                    {guide.difficulty}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {guide.title}
              </h1>

              {guide.excerpt && (
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                  {guide.excerpt}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {guide.read_time_minutes && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{guide.read_time_minutes} min read</span>
                  </div>
                )}
                {guide.published_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(guide.published_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-[1fr_300px] gap-8">
              {/* Main Content */}
              <article className="max-w-none">
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <div 
                      className="prose prose-lg max-w-none dark:prose-invert
                        prose-headings:font-bold prose-headings:text-foreground
                        prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                        prose-p:text-muted-foreground prose-p:leading-relaxed
                        prose-li:text-muted-foreground
                        prose-strong:text-foreground
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                      dangerouslySetInnerHTML={{ __html: guide.content }}
                    />
                  </CardContent>
                </Card>

                {/* Social Share */}
                <div className="mt-8">
                  <p className="text-sm text-muted-foreground mb-3">Share this guide:</p>
                  <SocialShareButtons 
                    url={pageUrl} 
                    title={guide.title} 
                    description={guide.excerpt || ''} 
                  />
                </div>
              </article>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Related Guides */}
                {relatedGuides && relatedGuides.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Related Guides</h3>
                      <div className="space-y-3">
                        {relatedGuides.map((related) => (
                          <Link 
                            key={related.id}
                            to={`/guides/${related.slug}`}
                            className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <p className="font-medium text-sm line-clamp-2">{related.title}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {related.read_time_minutes && (
                                <span>{related.read_time_minutes} min</span>
                              )}
                              {related.difficulty && (
                                <Badge variant="outline" className="text-xs py-0">
                                  {related.difficulty}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Links */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Quick Links</h3>
                    <div className="space-y-2">
                      <Link 
                        to="/visa-search" 
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        → Check Visa Requirements
                      </Link>
                      <Link 
                        to="/passport-index" 
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        → Passport Rankings
                      </Link>
                      <Link 
                        to="/countries" 
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        → Explore Countries
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GuidePage;
