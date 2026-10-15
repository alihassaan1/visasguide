import { useCountries } from "@/hooks/useSharedData";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Globe, FileText, Newspaper } from "lucide-react";

interface RelatedContentProps {
  currentSlug: string;
  contentType: "visa-requirements" | "country" | "blog" | "guide";
  country?: string;
  maxItems?: number;
}

const RelatedContent = ({
  currentSlug,
  contentType,
  country,
  maxItems = 6,
}: RelatedContentProps) => {
  // Fetch related content pages
  const { data: allCountries } = useCountries();
  const { data: relatedPages } = useQuery({
    queryKey: ["related-content", currentSlug, contentType, country],
    queryFn: async () => {
      const results: Array<{
        title: string;
        slug: string;
        type: string;
        excerpt?: string;
      }> = [];

      // Get related content pages based on type
      if (contentType === "visa-requirements" && country) {
        // Get other visa requirement pages for the same destination
        const { data: visaPages } = await supabase
          .from("content_pages")
          .select("title, slug, excerpt")
          .like("slug", `%-to-${country}-%`)
          .neq("slug", currentSlug)
          .eq("is_published", true)
          .limit(3);

        if (visaPages) {
          results.push(
            ...visaPages.map((p) => ({ ...p, type: "visa-requirements" }))
          );
        }

        // Get country guide for the destination
        const countryData = (allCountries || []).find((c) => c.slug === country);

        if (countryData) {
          results.push({
            title: `Complete ${countryData.name} Travel Guide`,
            slug: `/countries/${countryData.slug}`,
            type: "country",
          });
        }
      }

      if (contentType === "country" && country) {
        // Get popular visa requirement pages for this country
        const { data: visaPages } = await supabase
          .from("content_pages")
          .select("title, slug, excerpt")
          .like("slug", `%-to-${country}-%`)
          .eq("is_published", true)
          .limit(4);

        if (visaPages) {
          results.push(
            ...visaPages.map((p) => ({ ...p, type: "visa-requirements" }))
          );
        }
      }

      // Always fetch some related blog posts
      const { data: blogPosts } = await supabase
        .from("news_articles")
        .select("title, slug, excerpt")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(contentType === "blog" ? 4 : 2);

      if (blogPosts) {
        results.push(...blogPosts.map((p) => ({ ...p, type: "blog" })));
      }

      return results.slice(0, maxItems);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch popular destinations for internal linking
  const popularDestinations = (allCountries || [])
    .filter((c) => c.visa_free_destinations != null)
    .sort((a, b) => (b.visa_free_destinations as number) - (a.visa_free_destinations as number))
    .slice(0, 8);

  const getIcon = (type: string) => {
    switch (type) {
      case "visa-requirements":
        return <FileText className="h-4 w-4" />;
      case "country":
        return <Globe className="h-4 w-4" />;
      case "blog":
        return <Newspaper className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "visa-requirements":
        return "Visa Guide";
      case "country":
        return "Country Guide";
      case "blog":
        return "Article";
      default:
        return "Guide";
    }
  };

  const getLink = (item: { slug: string; type: string }) => {
    if (item.type === "visa-requirements") {
      return `/visa-requirements/${item.slug}`;
    }
    if (item.type === "blog") {
      return `/blog/${item.slug}`;
    }
    return item.slug.startsWith("/") ? item.slug : `/${item.slug}`;
  };

  if (!relatedPages?.length && !popularDestinations?.length) {
    return null;
  }

  return (
    <div className="mt-10 space-y-8">
      {/* Related Content */}
      {relatedPages && relatedPages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Related Information
          </h3>
          <div className="grid gap-3">
            {relatedPages.map((item) => (
              <Link
                key={item.slug}
                to={getLink(item)}
                className="group block"
              >
                <Card className="transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      {item.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Popular Destinations - Internal Linking */}
      {popularDestinations && popularDestinations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Explore More Destinations</h3>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.map((dest) => (
              <Link
                key={dest.slug}
                to={`/countries/${dest.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 text-sm font-medium transition-colors hover:text-primary"
              >
                <Globe className="h-3.5 w-3.5" />
                {dest.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatedContent;
