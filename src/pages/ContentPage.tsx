import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye } from "lucide-react";
import NotFound from "./NotFound";

const ContentPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (!error && data) {
        setPage(data);
        
        // Increment view count
        await supabase
          .from('content_pages')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id);
      }

      setLoading(false);
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-2 mt-8">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!page) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <title>{page.meta_title || page.title}</title>
      <meta name="description" content={page.meta_description || page.excerpt} />
      {page.keywords && <meta name="keywords" content={page.keywords.join(', ')} />}

      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": page.title,
            "description": page.excerpt,
            "datePublished": page.created_at,
            "dateModified": page.updated_at,
            "keywords": page.keywords?.join(', '),
            "publisher": {
              "@type": "Organization",
              "name": "Visas Guide",
              "url": "https://visas.guide"
            }
          })
        }}
      />

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

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated {new Date(page.updated_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{page.view_count || 0} views</span>
              </div>
            </div>

            {/* Keywords */}
            {page.keywords && page.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {page.keywords.map((keyword: string) => (
                  <Badge key={keyword} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {page.featured_image_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img 
                src={page.featured_image_url} 
                alt={page.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary-dark"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* Related Links */}
          <div className="mt-12 p-6 bg-accent/5 rounded-xl border">
            <h3 className="text-xl font-semibold mb-4">Need More Information?</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>Check out our other helpful guides:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><a href="/visa-search" className="text-primary hover:underline">Visa Requirements Search</a></li>
                <li><a href="/processing-times" className="text-primary hover:underline">Processing Times</a></li>
                <li><a href="/guides" className="text-primary hover:underline">All Visa Guides</a></li>
                <li><a href="/news" className="text-primary hover:underline">Latest Visa News</a></li>
              </ul>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default ContentPage;