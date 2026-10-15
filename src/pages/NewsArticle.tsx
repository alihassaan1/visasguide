import { useParams, Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ExternalLink, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { formatArticleContent } from "@/lib/contentFormatter";
import { getBlogFallbackImage, isBrokenImageUrl } from "@/lib/blogImageMap";
import AuthorBio from "@/components/AuthorBio";
import ArticleSchema from "@/components/ArticleSchema";
import RelatedContent from "@/components/RelatedContent";
import SocialShareButtons from "@/components/SocialShareButtons";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // First try news_articles table
  const { data: newsArticle, isLoading: newsLoading } = useQuery({
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

  // If not found in news_articles, try content_pages (for blog posts)
  const { data: contentPage, isLoading: contentLoading } = useQuery({
    queryKey: ['content-page-blog', slug],
    queryFn: async () => {
      // Try exact slug match first
      let { data, error } = await supabase
        .from('content_pages')
        .select(`
          *,
          writer:authors(name, slug, avatar_url, bio)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      
      if (!data) {
        // Try with blog/ prefix
        const result = await supabase
          .from('content_pages')
          .select(`
            *,
            writer:authors(name, slug, avatar_url, bio)
          `)
          .eq('slug', `blog/${slug}`)
          .eq('is_published', true)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug && !newsArticle && !newsLoading
  });

  // Combine article from either source
  const article = newsArticle || contentPage;
  const isLoading = newsLoading || (contentLoading && !newsArticle);
  const isFromContentPages = !newsArticle && !!contentPage;

  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', newsArticle?.categories],
    queryFn: async () => {
      if (!newsArticle?.categories || newsArticle.categories.length === 0) return [];
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .neq('id', newsArticle.id)
        .overlaps('categories', newsArticle.categories)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!newsArticle
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
          text: isFromContentPages ? article?.excerpt : (article as any)?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded-sm w-3/4"></div>
            <div className="h-64 bg-muted rounded-sm"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded-sm"></div>
              <div className="h-4 bg-muted rounded-sm"></div>
              <div className="h-4 bg-muted rounded-sm w-2/3"></div>
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
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle different data structures between news_articles and content_pages
  const title = article.title;
  const content = article.content;
  const excerpt = article.excerpt;
  const rawFeaturedImage = article.featured_image_url;
  const featuredImage = (!rawFeaturedImage || isBrokenImageUrl(rawFeaturedImage) || rawFeaturedImage.startsWith('/assets'))
    ? getBlogFallbackImage(slug || '')
    : rawFeaturedImage;
  const publishedAt = isFromContentPages ? article.created_at : (article as any).published_at;
  const updatedAt = article.updated_at;
  const categories = isFromContentPages 
    ? ((article as any).keywords || []) 
    : ((article as any).categories || []);
  const tags = isFromContentPages 
    ? ((article as any).keywords || []) 
    : ((article as any).tags || []);
  const authorName = isFromContentPages 
    ? ((article as any).writer?.name || "Visas.Guide Editorial Team")
    : ((article as any).author || "Visas.Guide Editorial Team");
  const writerId = (article as any).writer_id;
  const sourceName = isFromContentPages ? null : (article as any).source_name;

  const metaTitle = (isFromContentPages ? (article as any).meta_title : (article as any).seo_title) || `${title} | Visas.Guide Travel News`;
  const metaDescription = (isFromContentPages ? (article as any).meta_description : (article as any).seo_description) || excerpt || `Read about ${title} - Latest visa and travel news from Visas.Guide`;
  
  // Check if recently updated (within last 7 days)
  const isRecentlyUpdated = updatedAt && 
    (new Date().getTime() - new Date(updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonical={`https://visas.guide/blog/${slug}`}
        ogType="article"
        articlePublishedTime={publishedAt || undefined}
        articleModifiedTime={updatedAt}
        ogImage={featuredImage || undefined}
        keywords={[...tags, ...categories, "visa news", "travel news", "immigration updates"]}
      />
      
      {/* Article Schema for SEO */}
      <ArticleSchema
        title={title}
        description={metaDescription}
        url={`https://visas.guide/blog/${slug}`}
        imageUrl={featuredImage || undefined}
        datePublished={publishedAt || undefined}
        dateModified={updatedAt}
        authorName={authorName}
        keywords={[...tags, ...categories]}
        wordCount={content?.split(/\s+/).length}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
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
              <BreadcrumbPage>{title.substring(0, 40)}...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <div className="mb-6">
          <Link to="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <article className="lg:col-span-2 mb-12">
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {categories?.slice(0, 3).map((category: string, index: number) => (
                  <Badge key={index} variant="secondary">{category}</Badge>
                ))}
                {isRecentlyUpdated && (
                  <Badge className="bg-green-500 text-white">Recently Updated</Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {title}
              </h1>
              
              {excerpt && (
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  {excerpt}
                </p>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(publishedAt!)}
                  </div>
                  {authorName && (
                    <div className="flex items-center gap-2">
                      <span>By {authorName}</span>
                    </div>
                  )}
                  {sourceName && (
                    <div className="flex items-center gap-2">
                      <span>Source: {sourceName}</span>
                    </div>
                  )}
                </div>
                
                <SocialShareButtons
                  url={`https://visas.guide/blog/${slug}`}
                  title={title}
                  description={excerpt || undefined}
                />
              </div>
            </header>

            {/* Featured Image */}
            {featuredImage && (
              <div className="mb-8">
                <img 
                  src={featuredImage} 
                  alt={`${title} - Visa and travel news illustration`}
                  className="w-full rounded-lg shadow-lg"
                  loading="lazy"
                  onError={(e) => {
                    // Hide broken images gracefully
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pt-6 prose-h2:border-t prose-h2:border-border/40
              prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
              prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-3
              prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:my-6 prose-ul:space-y-2 prose-ol:my-6 prose-ol:space-y-2
              prose-li:text-muted-foreground prose-li:mb-2 prose-li:leading-relaxed
              prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:my-8 prose-blockquote:italic
              prose-img:rounded-lg prose-img:shadow-md prose-img:my-8">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: formatArticleContent(content) }} />
              ) : (
                <div className="text-muted-foreground">
                  <p>Article content is not available. Please visit the original source for the full article.</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <AuthorBio writerId={writerId} />

            {/* Related Content */}
            <RelatedContent
              currentSlug={slug || ''}
              contentType="blog"
              country={categories?.[0]}
            />
          </article>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Sponsored Ad Zone */}
              <div>
                <span className="text-xs text-muted-foreground block mb-1 text-center">Sponsored</span>
                <AffiliateBannerContainer position="sidebar-right" />
              </div>

              {/* Newsletter Signup */}
              <Card>
                <CardContent className="p-0">
                  <NewsletterSignup variant="sidebar" />
                </CardContent>
              </Card>

              {/* Second Ad Zone */}
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-6 text-center">
                  <span className="text-xs text-muted-foreground block mb-2">Advertisement</span>
                  <div className="h-[250px] bg-muted/50 rounded-sm flex items-center justify-center">
                    {/* Ad placeholder */}
                  </div>
                </CardContent>
              </Card>

              {/* Affiliate Banners - in-content position */}
              <AffiliateBannerContainer position="in-content" />
            </div>
          </aside>
        </div>

        {/* Related Articles (only for news_articles) - full width below */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Card key={related.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {related.featured_image_url && (
                    <div className="aspect-video bg-muted">
                      <img 
                        src={related.featured_image_url} 
                        alt={related.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
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
