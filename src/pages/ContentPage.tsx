import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';

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
        const { data, error } = await supabase
          .from('content_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

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
      {/* SEO Meta Tags */}
      <title>{page.meta_title || page.title}</title>
      <meta name="description" content={page.meta_description || page.excerpt} />
      {page.keywords && <meta name="keywords" content={page.keywords.join(', ')} />}

      <Header />
      
      <main className="container mx-auto px-4 py-12">
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
                alt={page.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

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
      </main>

      <Footer />
    </div>
  );
}
