import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Pin } from "lucide-react";

// Import destination images
import thailandImg from "@/assets/destinations/thailand.jpg";
import uaeImg from "@/assets/destinations/uae.jpg";
import japanImg from "@/assets/destinations/japan.jpg";
import canadaImg from "@/assets/destinations/canada.jpg";
import franceImg from "@/assets/destinations/france.jpg";
import singaporeImg from "@/assets/destinations/singapore.jpg";
import malaysiaImg from "@/assets/destinations/malaysia.jpg";
import indonesiaImg from "@/assets/destinations/indonesia.jpg";
import polandImg from "@/assets/destinations/poland.jpg";
import hungaryImg from "@/assets/destinations/hungary.jpg";
import slovakiaImg from "@/assets/destinations/slovakia.jpg";
import sloveniaImg from "@/assets/destinations/slovenia.jpg";
import icelandImg from "@/assets/destinations/iceland.jpg";
import lithuaniaImg from "@/assets/destinations/lithuania.jpg";
import southKoreaImg from "@/assets/destinations/south-korea.jpg";
import pakistanImg from "@/assets/destinations/pakistan.jpg";

// Country image mapping
const countryImages: Record<string, string> = {
  'thailand': thailandImg,
  'united-arab-emirates': uaeImg,
  'uae': uaeImg,
  'japan': japanImg,
  'canada': canadaImg,
  'france': franceImg,
  'singapore': singaporeImg,
  'malaysia': malaysiaImg,
  'indonesia': indonesiaImg,
  'poland': polandImg,
  'hungary': hungaryImg,
  'slovakia': slovakiaImg,
  'slovenia': sloveniaImg,
  'iceland': icelandImg,
  'lithuania': lithuaniaImg,
  'south-korea': southKoreaImg,
  'pakistan': pakistanImg,
  'germany': franceImg,
  'italy': franceImg,
  'spain': franceImg,
  'netherlands': franceImg,
  'belgium': franceImg,
  'austria': hungaryImg,
  'switzerland': slovakiaImg,
  'czech-republic': hungaryImg,
  'united-states': canadaImg,
  'usa': canadaImg,
  'united-kingdom': franceImg,
  'uk': franceImg,
  'australia': singaporeImg,
  'new-zealand': singaporeImg,
  'india': pakistanImg,
  'china': japanImg,
  'vietnam': thailandImg,
  'philippines': indonesiaImg,
};

// Extract country slug from title (e.g., "Thailand Visa Requirements" -> "thailand")
const extractCountryFromTitle = (title: string): string | null => {
  // Common patterns: "X Visa Requirements", "X to Y Visa", "How to Get X Visa"
  const patterns = [
    /^([A-Za-z\s-]+?)\s+(?:Visa|Tourist|Travel|Entry)/i,
    /to\s+([A-Za-z\s-]+?)\s+(?:Visa|Tourist|Travel)/i,
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim().toLowerCase().replace(/\s+/g, '-');
    }
  }
  return null;
};

// Get image for guide based on title
const getGuideImage = (title: string, featuredImageUrl?: string | null): string | null => {
  if (featuredImageUrl) return featuredImageUrl;
  
  const countrySlug = extractCountryFromTitle(title);
  if (countrySlug && countryImages[countrySlug]) {
    return countryImages[countrySlug];
  }
  
  // Try partial matches
  for (const [key, img] of Object.entries(countryImages)) {
    if (title.toLowerCase().includes(key.replace(/-/g, ' '))) {
      return img;
    }
  }
  
  return null;
};

// Get flag emoji from country name
const getCountryFlag = (title: string): string => {
  const flagMap: Record<string, string> = {
    'thailand': '🇹🇭',
    'united arab emirates': '🇦🇪',
    'uae': '🇦🇪',
    'japan': '🇯🇵',
    'canada': '🇨🇦',
    'france': '🇫🇷',
    'germany': '🇩🇪',
    'italy': '🇮🇹',
    'spain': '🇪🇸',
    'singapore': '🇸🇬',
    'malaysia': '🇲🇾',
    'indonesia': '🇮🇩',
    'south korea': '🇰🇷',
    'poland': '🇵🇱',
    'hungary': '🇭🇺',
    'iceland': '🇮🇸',
    'united states': '🇺🇸',
    'usa': '🇺🇸',
    'united kingdom': '🇬🇧',
    'uk': '🇬🇧',
    'australia': '🇦🇺',
    'india': '🇮🇳',
    'china': '🇨🇳',
    'pakistan': '🇵🇰',
  };
  
  const titleLower = title.toLowerCase();
  for (const [country, flag] of Object.entries(flagMap)) {
    if (titleLower.includes(country)) {
      return flag;
    }
  }
  return '🌍';
};

const LatestGuidesSection = () => {
  const { data: guides, isLoading } = useQuery({
    queryKey: ['latest-guides-home'],
    queryFn: async () => {
      // Pinned/featured posts first, then most recently updated
      const { data: featured } = await supabase
        .from('content_pages')
        .select(`
          id, title, slug, excerpt, featured_image_url, updated_at, view_count, is_featured,
          writer:authors(name, slug, avatar_url)
        `)
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('featured_at', { ascending: false })
        .limit(6);

      const featuredIds = (featured || []).map((p: any) => p.id);
      const remaining = 6 - (featured?.length || 0);

      let latest: any[] = [];
      if (remaining > 0) {
        let q = supabase
          .from('content_pages')
          .select(`
            id, title, slug, excerpt, featured_image_url, updated_at, view_count, is_featured,
            writer:authors(name, slug, avatar_url)
          `)
          .eq('is_published', true)
          .order('updated_at', { ascending: false })
          .limit(remaining);
        if (featuredIds.length) q = q.not('id', 'in', `(${featuredIds.join(',')})`);
        const { data } = await q;
        latest = data || [];
      }

      return [...(featured || []), ...latest];
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
                  <div className="h-4 bg-muted rounded-sm mb-2"></div>
                  <div className="h-3 bg-muted rounded-sm w-2/3"></div>
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
          {guides.map((guide) => {
            const image = getGuideImage(guide.title, guide.featured_image_url);
            const flag = getCountryFlag(guide.title);
            
            return (
              <Link key={guide.id} to={`/${guide.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden group rounded-2xl">
                  <div className="h-44 overflow-hidden relative rounded-xl">
                    {image ? (
                      <>
                        <img 
                          src={image} 
                          alt={guide.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        {/* Subtle flag badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm shadow-xs font-emoji">
                            {flag}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <span className="text-5xl font-emoji">{flag}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      {guide.writer && <span>By {guide.writer.name}</span>}
                      {guide.writer && <span className="text-muted-foreground/40">•</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Updated {formatDate(guide.updated_at)}
                      </span>
                    </div>
                    {guide.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {guide.excerpt}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LatestGuidesSection;
