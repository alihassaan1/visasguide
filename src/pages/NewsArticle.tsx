import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ExternalLink, ArrowLeft, Share2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { formatArticleContent } from "@/lib/contentFormatter";

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: article, isLoading } = useQuery({
    queryKey: ['news-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', article?.categories],
    queryFn: async () => {
      if (!article?.categories || article.categories.length === 0) return [];
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .neq('id', article.id)
        .overlaps('categories', article.categories)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!article
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to News
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const metaTitle = article.seo_title || `${article.title} | Visas.Guide Travel News`;
  const metaDescription = article.seo_description || article.excerpt || `Read about ${article.title} - Latest visa and travel news from Visas.Guide`;
  
  // Check if recently updated (within last 7 days)
  const isRecentlyUpdated = article.updated_at && 
    (new Date().getTime() - new Date(article.updated_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonical={`https://visas.guide/blog/${article.slug}`}
        ogType="article"
        articlePublishedTime={article.published_at || undefined}
        articleModifiedTime={article.updated_at}
        ogImage={article.featured_image_url || undefined}
        keywords={[...(article.tags || []), ...(article.categories || []), "visa news", "travel news", "immigration updates"]}
      />
      
      {/* SEO Meta Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": article.excerpt,
            "url": `https://visas.guide/blog/${article.slug}`,
            "datePublished": article.published_at,
            "dateModified": article.updated_at,
            "author": {
              "@type": "Organization",
              "name": article.author || "Visas Guide"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Visas Guide",
              "url": "https://visas.guide"
            }
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/blog">Blog</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{article.title.substring(0, 40)}...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <div className="mb-6">
          <Link to="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <article className="mb-12">
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {article.categories?.map((category, index) => (
                <Badge key={index} variant="secondary">{category}</Badge>
              ))}
              {isRecentlyUpdated && (
                <Badge className="bg-green-500 text-white">Recently Updated</Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.published_at!)}
                </div>
                {article.author && (
                  <div className="flex items-center gap-2">
                    <span>By {article.author}</span>
                  </div>
                )}
                {article.source_name && (
                  <div className="flex items-center gap-2">
                    <span>Source: {article.source_name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {article.source_url && (
                  <a 
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Original Source
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="mb-8">
              <img 
                src={article.featured_image_url} 
                alt={`${article.title} - Visa and travel news illustration`}
                className="w-full rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: formatArticleContent(article.content) }} />
            ) : (
              <div className="text-muted-foreground">
                <p>Article content is not available. Please visit the original source for the full article.</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Newsletter Signup */}
        <div className="my-12">
          <NewsletterSignup variant="sidebar" />
        </div>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Card key={related.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {related.featured_image_url && (
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={related.featured_image_url} 
                        alt={related.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex gap-2 mb-2">
                      {related.categories?.slice(0, 1).map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{category}</Badge>
                      ))}
                    </div>
                    <h3 className="font-semibold line-clamp-2 mb-2">
                      <Link 
                        to={`/blog/${related.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {related.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {related.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(related.published_at!)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default NewsArticle;