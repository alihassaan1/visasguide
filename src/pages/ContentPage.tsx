import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Clock, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import SocialShareButtons from '@/components/SocialShareButtons';
import AuthorBio from '@/components/AuthorBio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RelatedContent from '@/components/RelatedContent';
import { AffiliateBannerContainer } from '@/components/AffiliateBannerContainer';

// Estimate reading time based on content
const estimateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, '');
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

export default function ContentPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        // Check if user is admin to allow viewing drafts
        const { data: { user } } = await supabase.auth.getUser();
        const { data: userRole } = user ? await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle() : { data: null };
        
        const isAdmin = userRole?.role === 'admin';
        
        // Build query - admins can see all, others only published
        let query = supabase
          .from('content_pages')
          .select('*')
          .eq('slug', slug);
        
        if (!isAdmin) {
          query = query.eq('is_published', true);
        }
        
        const { data, error } = await query.maybeSingle();

        if (error) throw error;

        if (data) {
          setPage(data);
          // Increment view count
          await supabase
            .from('content_pages')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id);
        } else {
          toast({
            title: "Page not found",
            description: "The requested page could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        toast({
          title: "Error",
          description: "Failed to load page content.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-[400px] w-full rounded-xl" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readingTime = estimateReadingTime(page.content || '');

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={page.meta_title || `${page.title} | Visas.Guide`}
        description={page.meta_description || page.excerpt || `Learn about ${page.title} on Visas.Guide`}
        canonical={`https://visas.guide/${page.slug}`}
        keywords={page.keywords || []}
        ogImage={page.featured_image_url}
      />

      <Header />
      
      {!page.is_published && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-3">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-medium text-yellow-700 dark:text-yellow-500">
              📝 Preview Mode: This page is not published yet
            </p>
          </div>
        </div>
      )}
      
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
                <Link to="/guides">Guides</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[200px]">{page.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <article className="lg:col-span-2">
            {/* Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight font-serif">
                {page.title}
              </h1>
              {page.excerpt && (
                <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
                  {page.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={page.updated_at}>
                    {new Date(page.updated_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{(page.view_count || 0).toLocaleString()} views</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {page.featured_image_url && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={page.featured_image_url} 
                  alt={`${page.title} - comprehensive visa and travel guide illustration`}
                  className="w-full h-[350px] md:h-[450px] object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Content with improved typography */}
            <div 
              className="prose prose-lg max-w-none 
                prose-headings:font-serif prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:mb-2
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />

            {/* In-content Ad Zone */}
            <div className="my-8 p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20 text-center">
              <span className="text-xs text-muted-foreground">Advertisement</span>
              {/* Ad placeholder - integrate with Google AdSense */}
            </div>

            {/* Social Share Buttons */}
            <div className="mt-10 pt-6 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Share this guide</h3>
              <SocialShareButtons
                url={`https://visas.guide/${page.slug}`}
                title={page.title}
                description={page.excerpt || page.meta_description}
              />
            </div>

            {/* Author Bio */}
            <div className="mt-8">
              <AuthorBio writerId={page.writer_id} />
            </div>

            {/* Keywords */}
            {page.keywords && page.keywords.length > 0 && (
              <div className="mt-10 pt-6 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {page.keywords.map((keyword: string) => (
                    <Badge 
                      key={keyword}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm hover:bg-accent cursor-pointer transition-colors"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar - 1/3 width */}
          <aside className="space-y-6">

            {/* Ad Zone 1 */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 text-center">
                <span className="text-xs text-muted-foreground block mb-2">Advertisement</span>
                <div className="h-[250px] bg-muted/50 rounded flex items-center justify-center">
                  {/* Ad placeholder */}
                </div>
              </CardContent>
            </Card>

            {/* Affiliate Banner */}
            <AffiliateBannerContainer position="sidebar-right" />

            {/* Newsletter Signup */}
            <Card>
              <CardContent className="p-0">
                <NewsletterSignup variant="sidebar" />
              </CardContent>
            </Card>

            {/* Related Content */}
            <RelatedContent 
              currentSlug={page.slug} 
              contentType="guide"
              maxItems={4}
            />

            {/* Ad Zone 2 */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 text-center">
                <span className="text-xs text-muted-foreground block mb-2">Advertisement</span>
                <div className="h-[300px] bg-muted/50 rounded flex items-center justify-center">
                  {/* Ad placeholder */}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
