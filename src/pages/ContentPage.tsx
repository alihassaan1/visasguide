import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import NewsletterSignup from '@/components/NewsletterSignup';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import SocialShareButtons from '@/components/SocialShareButtons';
import AuthorBio from '@/components/AuthorBio';

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
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-96 w-full" />
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
      
      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6 max-w-4xl mx-auto">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{page.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {page.title}
            </h1>
            {page.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">
                {page.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={page.updated_at}>
                Updated: {new Date(page.updated_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {page.view_count || 0} views
              </span>
            </div>
          </header>

          {/* Featured Image */}
          {page.featured_image_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img 
                src={page.featured_image_url} 
                alt={`${page.title} - comprehensive visa and travel guide illustration`}
                className="w-full h-[400px] object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* Social Share Buttons */}
          <div className="mt-8 pt-6 border-t">
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
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Related Topics:</h3>
              <div className="flex flex-wrap gap-2">
                {page.keywords.map((keyword: string) => (
                  <span 
                    key={keyword}
                    className="px-3 py-1 bg-accent/50 text-accent-foreground rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Newsletter Signup */}
        <div className="mt-12 max-w-4xl mx-auto">
          <NewsletterSignup variant="sidebar" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
