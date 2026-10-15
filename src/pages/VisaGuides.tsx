import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, ArrowRight, Star, BookOpen, Loader2, Search, FileText, CheckCircle, Lightbulb, Scale } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Link } from "@/lib/router-compat";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateBannerContainer } from "@/components/AffiliateBannerContainer";

// Import destination images for guide thumbnails
import franceImg from "@/assets/destinations/france.jpg";
import canadaImg from "@/assets/destinations/canada.jpg";
import japanImg from "@/assets/destinations/japan.jpg";
import uaeImg from "@/assets/destinations/uae.jpg";
import singaporeImg from "@/assets/destinations/singapore.jpg";
import thailandImg from "@/assets/destinations/thailand.jpg";
import polandImg from "@/assets/destinations/poland.jpg";
import icelandImg from "@/assets/destinations/iceland.jpg";

const guideImageMap: Record<string, string> = {
  'schengen': franceImg,
  'us-esta': canadaImg,
  'uk-visitor': polandImg,
  'japan': japanImg,
  'australia': singaporeImg,
  'canada': canadaImg,
  'travel-insurance': icelandImg,
  'visa-rejection': uaeImg,
  'dubai': uaeImg,
  'thailand': thailandImg,
};

const getGuideImage = (slug: string): string | null => {
  for (const [key, img] of Object.entries(guideImageMap)) {
    if (slug.includes(key)) return img;
  }
  return null;
};

const GUIDES_PER_PAGE = 9;

const categoryConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  'application': { icon: <FileText className="h-4 w-4" />, label: 'Application' },
  'requirements': { icon: <CheckCircle className="h-4 w-4" />, label: 'Requirements' },
  'tips': { icon: <Lightbulb className="h-4 w-4" />, label: 'Tips & Advice' },
  'comparison': { icon: <Scale className="h-4 w-4" />, label: 'Comparison' },
};

const VisaGuides = () => {
  const [activeCategory, setActiveCategory] = useState("All Guides");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: guides, isLoading } = useQuery({
    queryKey: ['visa-guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const categories = useMemo(() => {
    const types = new Set(guides?.map(g => g.guide_type) || []);
    return ["All Guides", ...Array.from(types).filter(Boolean)];
  }, [guides]);

  const filteredGuides = useMemo(() => {
    if (!guides) return [];
    let result = guides;
    if (activeCategory !== "All Guides") {
      result = result.filter(g => g.guide_type === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.excerpt?.toLowerCase().includes(q) ||
        g.guide_type?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [guides, activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredGuides.length / GUIDES_PER_PAGE);
  const paginatedGuides = filteredGuides.slice(
    (currentPage - 1) * GUIDES_PER_PAGE,
    currentPage * GUIDES_PER_PAGE
  );

  const featuredGuides = paginatedGuides.filter(g => g.is_featured);
  const regularGuides = paginatedGuides.filter(g => !g.is_featured);

  // Reset page when filters change
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400';
      case 'medium': return 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400';
      case 'hard': return 'bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryInfo = (type: string | null) => {
    return categoryConfig[type || ''] || { icon: <BookOpen className="h-4 w-4" />, label: type?.replace('_', ' ') || 'Guide' };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const GuideCard = ({ guide, isFeatured = false }: { guide: any; isFeatured?: boolean }) => {
    const image = guide.featured_image_url || getGuideImage(guide.slug);
    const catInfo = getCategoryInfo(guide.guide_type);

    return (
      <Link to={`/guides/${guide.slug}`}>
        <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-1 ${isFeatured ? 'border-primary/20' : ''}`}>
          {/* Image */}
          <div className="relative aspect-[16/9] overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={guide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-primary/20 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {isFeatured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                </Badge>
              </div>
            )}
            {guide.difficulty && (
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className={`${getDifficultyColor(guide.difficulty)} bg-white/90 dark:bg-black/60 backdrop-blur-sm`}>
                  {guide.difficulty}
                </Badge>
              </div>
            )}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-white/90 dark:bg-black/60 backdrop-blur-sm text-foreground capitalize gap-1">
                {catInfo.icon}
                {catInfo.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
              {guide.title}
            </h3>
            {guide.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {guide.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {guide.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(guide.published_at)}
                  </span>
                )}
                {guide.read_time_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {guide.read_time_minutes} min
                  </span>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Visa Application Guides & Travel Documentation Tips 2026 | Visas.Guide"
        description="Step-by-step visa application guides for popular destinations. Expert tips on Schengen, US ESTA, UK visitor visas, and more. Avoid common mistakes and get approved."
        canonical="https://visas.guide/guides"
        keywords={["visa application guide", "how to apply for visa", "schengen visa guide", "ESTA application", "UK visa tips", "visa documentation", "travel visa help"]}
      />
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-8 md:p-12 mb-10">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="text-primary border-primary/30">Expert Guides</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Visa Guides & Travel Information
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive visa guides, application tips, and travel requirements for destinations worldwide. Written by experts, updated for 2026.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const catInfo = category === "All Guides" ? null : getCategoryInfo(category);
              return (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleCategoryChange(category)}
                >
                  {catInfo?.icon}
                  {catInfo?.label || category}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading guides...</span>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No guides found</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? `No results for "${searchQuery}". Try a different search.` : 'Check back soon for new visa guides.'}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => { setSearchQuery(""); setCurrentPage(1); }}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Guides */}
            {featuredGuides.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary fill-primary/20" />
                  Featured Guides
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredGuides.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} isFeatured />
                  ))}
                </div>
              </section>
            )}

            {/* Horizontal Banner */}
            <div className="my-8">
              <AffiliateBannerContainer position="horizontal-banner" />
            </div>

            {/* Regular Guides */}
            {regularGuides.length > 0 && (
              <section className="mb-12">
                {featuredGuides.length > 0 && (
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    All Visa Guides
                  </h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularGuides.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
              </section>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Quick Links */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Quick Links</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/schengen-visa-guide">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    🇪🇺 Schengen Visa Guide
                  </Button>
                </Link>
                <Link to="/passport-index">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    🛂 Passport Rankings
                  </Button>
                </Link>
                <Link to="/visa-search">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    🔍 Visa Search
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    📰 Travel Blog
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VisaGuides;
