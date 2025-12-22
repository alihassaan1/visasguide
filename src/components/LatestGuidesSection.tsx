import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

const LatestGuidesSection = () => {
  const { data: guides, isLoading } = useQuery({
    queryKey: ['latest-guides-home'],
    queryFn: async () => {
      const { data } = await supabase
        .from('content_pages')
        .select(`
          id, title, slug, excerpt, featured_image_url, updated_at, view_count,
          writer:authors(name, slug, avatar_url)
        `)
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(6);
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Visa Guides</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted"></div>
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

  if (!guides?.length) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Latest Visa Guides</h2>
          <Link 
            to="/guides" 
            className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link key={guide.id} to={`/${guide.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group">
                {guide.featured_image_url && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={guide.featured_image_url} 
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  {guide.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {guide.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(guide.updated_at)}
                    </div>
                    {guide.writer && (
                      <span>By {guide.writer.name}</span>
                    )}
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

export default LatestGuidesSection;
