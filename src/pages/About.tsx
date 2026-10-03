import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthors, useCountries } from "@/hooks/useSharedData";
import { Link } from "react-router-dom";
import { Globe, Shield, Users, BookOpen, CheckCircle, MapPin, Mail, Award } from "lucide-react";

const About = () => {
  const { data: allAuthors } = useAuthors();
  const authors = (allAuthors || []).filter((a: any) => a.is_active);
  const { data: allCountries } = useCountries();

  const { data: pageStats } = useQuery({
    queryKey: ['about-stats'],
    queryFn: async () => {
      const [contentResult, guidesResult] = await Promise.all([
        supabase.from('content_pages').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('guides').select('id', { count: 'exact', head: true }).not('published_at', 'is', null)
      ]);
      return {
        content: contentResult.count || 0,
        guides: guidesResult.count || 0
      };
    }
  });
  const stats = pageStats
    ? { countries: allCountries?.length || 195, ...pageStats }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Visas.Guide — Trusted Visa Information"
        description="Learn about Visas.Guide and our team of visa experts who help travelers navigate visa requirements for 200+ countries worldwide."
        canonical="https://visas.guide/about"
        keywords={["about visas guide", "visa information team", "travel experts", "visa specialists"]}
      />
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-foreground/10 text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Visas.Guide
              </h1>
              <p className="text-xl text-primary-foreground/90">
                Your trusted companion for navigating visa requirements and travel documentation worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground">
                  At Visas.Guide, we believe that understanding visa requirements should never be a barrier to exploring the world. 
                  Our mission is to provide accurate, up-to-date, and easy-to-understand visa information for travelers from every country.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center p-6">
                  <CardContent className="pt-4">
                    <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Global Coverage</h3>
                    <p className="text-muted-foreground">
                      We cover visa requirements for {stats?.countries || 195}+ countries, helping travelers worldwide plan their journeys.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center p-6">
                  <CardContent className="pt-4">
                    <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Verified Information</h3>
                    <p className="text-muted-foreground">
                      Our content is researched and verified by immigration experts to ensure accuracy and reliability.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center p-6">
                  <CardContent className="pt-4">
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
                    <p className="text-muted-foreground">
                      Our team includes former consular officers, immigration lawyers, and seasoned travel writers.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-primary">{stats?.countries || 195}+</p>
                <p className="text-muted-foreground">Countries Covered</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">{stats?.content || 0}+</p>
                <p className="text-muted-foreground">Visa Guides</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">24/7</p>
                <p className="text-muted-foreground">Updated Information</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">1M+</p>
                <p className="text-muted-foreground">Travelers Helped</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Trust Us Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Why Trust Visas.Guide?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Expert-Verified Content</h3>
                    <p className="text-muted-foreground">
                      Every piece of content is reviewed by our team of immigration specialists before publication. 
                      We cross-reference information with official embassy websites and government sources.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Regular Updates</h3>
                    <p className="text-muted-foreground">
                      Visa policies change frequently. We monitor official government announcements and update our 
                      content within 24-48 hours of policy changes to keep you informed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Transparent Editorial Process</h3>
                    <p className="text-muted-foreground">
                      We follow strict editorial guidelines to ensure our content is unbiased and accurate. 
                      Read our <Link to="/editorial-policy" className="text-primary hover:underline">Editorial Policy</Link> for more details.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">No Hidden Agendas</h3>
                    <p className="text-muted-foreground">
                      We disclose all affiliate relationships transparently. Our recommendations are based on 
                      quality and value, not commissions. See our <Link to="/affiliate-disclosure" className="text-primary hover:underline">Affiliate Disclosure</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Meet Our Expert Team</h2>
                <p className="text-muted-foreground text-lg">
                  Our team brings decades of combined experience in travel, immigration, and visa consulting.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authors?.map((author) => (
                  <Link key={author.id} to={`/author/${author.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {author.avatar_url ? (
                              <img 
                                src={author.avatar_url} 
                                alt={author.name}
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl font-bold text-primary">
                                {author.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg">{author.name}</h3>
                            <p className="text-sm text-primary mb-2">{author.role}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mt-4 line-clamp-3">
                          {author.bio}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {author.expertise?.slice(0, 3).map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Process Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Our Editorial Process</h2>
                <p className="text-muted-foreground">
                  We follow a rigorous process to ensure every piece of content meets our high standards.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">Research</h3>
                  <p className="text-sm text-muted-foreground">
                    We gather information from official government sources and embassies.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">Writing</h3>
                  <p className="text-sm text-muted-foreground">
                    Our expert writers create clear, actionable content.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">Review</h3>
                  <p className="text-sm text-muted-foreground">
                    Immigration experts verify accuracy and completeness.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                    4
                  </div>
                  <h3 className="font-semibold mb-2">Update</h3>
                  <p className="text-sm text-muted-foreground">
                    We continuously monitor and update published content.
                  </p>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link 
                  to="/editorial-policy" 
                  className="text-primary hover:underline font-medium"
                >
                  Read our full Editorial Policy →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Have questions or feedback? We would love to hear from you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href="mailto:info@visas.guide" className="text-primary hover:underline">
                    info@visas.guide
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">Austin, Texas, USA</span>
                </div>
              </div>

              <div className="mt-8">
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
