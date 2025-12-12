import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Star, TrendingUp, BookOpen, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const VisaGuides = () => {
  const [activeCategory, setActiveCategory] = useState("All Guides");

  // Fetch guides from database
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
    if (activeCategory === "All Guides") return guides;
    return guides.filter(g => g.guide_type === activeCategory);
  }, [guides, activeCategory]);

  const featuredGuides = filteredGuides.filter(g => g.is_featured);
  const regularGuides = filteredGuides.filter(g => !g.is_featured);

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getGuideIcon = (type: string | null) => {
    switch (type) {
      case 'application': return '📝';
      case 'requirements': return '📋';
      case 'comparison': return '⚖️';
      case 'tips': return '💡';
      default: return '📖';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Visa Application Guides & Travel Documentation Tips 2025 | Visas.Guide"
        description="Step-by-step visa application guides for popular destinations. Expert tips on Schengen, US ESTA, UK visitor visas, and more. Avoid common mistakes and get approved."
        canonical="https://visas.guide/guides"
        keywords={["visa application guide", "how to apply for visa", "schengen visa guide", "ESTA application", "UK visa tips", "visa documentation", "travel visa help"]}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-8 md:p-12 mb-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="text-primary border-primary/30">Expert Guides</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Visa Guides & Travel Information
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive visa guides, application tips, and travel requirements for destinations worldwide. Written by experts, updated for 2025.
            </p>
          </div>
          <div className="absolute right-8 bottom-8 opacity-10 text-[200px] font-bold text-primary hidden lg:block">
            ✈️
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((category, index) => (
            <Button 
              key={index}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              className="text-sm capitalize"
              onClick={() => setActiveCategory(category)}
            >
              {category.replace('_', ' ')}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading guides...</span>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No guides found</h2>
            <p className="text-muted-foreground">Check back soon for new visa guides.</p>
          </div>
        ) : (
          <>
            {/* Featured Guides */}
            {featuredGuides.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center space-x-2 mb-8">
                  <Star className="h-6 w-6 text-primary fill-primary/20" />
                  <h2 className="text-3xl font-bold text-foreground">Featured Guides</h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                  {featuredGuides.slice(0, 3).map((guide) => (
                    <Card key={guide.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1 overflow-hidden">
                      <CardContent className="p-0">
                        {/* Header with icon */}
                        <div className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 p-8 text-center">
                          <span className="text-6xl block drop-shadow-lg">{getGuideIcon(guide.guide_type)}</span>
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-primary text-primary-foreground shadow-lg">Featured</Badge>
                          </div>
                          {guide.difficulty && (
                            <div className="absolute top-3 right-3">
                              <Badge variant="outline" className={getDifficultyColor(guide.difficulty)}>
                                {guide.difficulty}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(guide.published_at)}</span>
                            </div>
                            {guide.read_time_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{guide.read_time_minutes} min read</span>
                              </div>
                            )}
                          </div>

                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                            {guide.title}
                          </h3>

                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                            {guide.excerpt}
                          </p>

                          <Link to={`/guides/${guide.slug}`}>
                            <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              Read Full Guide
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* All Guides */}
            {regularGuides.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center space-x-2 mb-8">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl font-bold text-foreground">All Visa Guides</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularGuides.map((guide) => (
                    <Card key={guide.id} className="group hover:shadow-lg transition-all duration-300 border bg-card hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <span className="text-3xl">{getGuideIcon(guide.guide_type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {guide.guide_type?.replace('_', ' ') || 'Guide'}
                              </Badge>
                              {guide.difficulty && (
                                <Badge variant="outline" className={`text-xs ${getDifficultyColor(guide.difficulty)}`}>
                                  {guide.difficulty}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {guide.title}
                            </h3>
                          </div>
                        </div>

                        {guide.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {guide.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(guide.published_at)}</span>
                          </div>
                          {guide.read_time_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{guide.read_time_minutes} min</span>
                            </div>
                          )}
                        </div>

                        <Link to={`/guides/${guide.slug}`}>
                          <Button variant="ghost" size="sm" className="w-full justify-between text-primary hover:text-primary-foreground hover:bg-primary transition-all">
                            Read Guide
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
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
