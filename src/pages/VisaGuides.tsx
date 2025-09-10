import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Star, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const VisaGuides = () => {
  const featuredGuides = [
    {
      title: "US ESTA Application: Complete Step-by-Step Guide 2024",
      excerpt: "Everything you need to know about applying for ESTA authorization to visit the United States as a tourist or business traveler.",
      category: "United States",
      readTime: "8 min read",
      publishDate: "Dec 15, 2024",
      isNew: true,
      isFeatured: true,
      flag: "🇺🇸",
      difficulty: "Medium",
      slug: "us-esta-application-guide"
    },
    {
      title: "Schengen Visa Requirements: Complete Documents Checklist",
      excerpt: "Complete documentation requirements and tips for a successful Schengen visa application to visit European Union countries.",
      category: "Europe",
      readTime: "12 min read", 
      publishDate: "Dec 12, 2024",
      isNew: true,
      isFeatured: true,
      flag: "🇪🇺",
      difficulty: "Hard",
      slug: "schengen-visa-requirements"
    },
    {
      title: "UK Visitor Visa: Processing Times and Success Tips",
      excerpt: "Current processing times, requirements, and expert tips to increase your chances of UK visitor visa approval.",
      category: "United Kingdom",
      readTime: "10 min read",
      publishDate: "Dec 10, 2024",
      isNew: false,
      isFeatured: true,
      flag: "🇬🇧", 
      difficulty: "Medium",
      slug: "uk-visitor-visa-guide"
    }
  ];

  const allGuides = [
    {
      title: "Canada eTA vs Visitor Visa: Which Do You Need?",
      category: "Canada",
      readTime: "6 min read",
      publishDate: "Dec 8, 2024",
      flag: "🇨🇦",
      difficulty: "Easy",
      slug: "canada-eta-vs-visitor-visa"
    },
    {
      title: "Australia ETA Application: Quick Guide for Tourists",
      category: "Australia", 
      readTime: "5 min read",
      publishDate: "Dec 5, 2024",
      flag: "🇦🇺",
      difficulty: "Easy",
      slug: "australia-eta-application"
    },
    {
      title: "Japan Tourist Visa: Everything You Need to Know",
      category: "Japan",
      readTime: "9 min read", 
      publishDate: "Dec 3, 2024",
      flag: "🇯🇵",
      difficulty: "Medium",
      slug: "japan-tourist-visa-guide"
    },
    {
      title: "Common Visa Rejection Reasons and How to Avoid Them",
      category: "General",
      readTime: "7 min read",
      publishDate: "Nov 28, 2024", 
      flag: "📋",
      difficulty: "Medium",
      slug: "visa-rejection-reasons"
    },
    {
      title: "Travel Insurance Requirements by Country",
      category: "Requirements",
      readTime: "11 min read",
      publishDate: "Nov 25, 2024",
      flag: "🛡️", 
      difficulty: "Easy",
      slug: "travel-insurance-requirements"
    }
  ];

  const categories = [
    "All Guides", "United States", "Europe", "United Kingdom", "Canada", "Australia", "Asia", "Requirements", "General"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Visa Guides & Travel Information
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive visa guides, application tips, and travel requirements for destinations worldwide
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((category, index) => (
            <Button 
              key={index}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              className="text-sm"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Guides */}
        <section className="mb-16">
          <div className="flex items-center space-x-2 mb-8">
            <Star className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Featured Guides</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {featuredGuides.map((guide, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {/* Flag Header */}
                    <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 p-8 text-center">
                      <span className="text-4xl">{guide.flag}</span>
                      <div className="absolute top-3 left-3">
                        {guide.isNew && (
                          <Badge className="bg-visa-success text-white">New</Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className={
                          guide.difficulty === "Easy" ? "text-visa-success border-visa-success" :
                          guide.difficulty === "Medium" ? "text-visa-warning border-visa-warning" :
                          "text-visa-danger border-visa-danger"
                        }>
                          {guide.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      {/* Meta */}
                      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{guide.publishDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{guide.readTime}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                        {guide.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                        {guide.excerpt}
                      </p>

                      {/* CTA */}
                      <Link to={`/guides/${guide.slug}`}>
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Read Full Guide
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Guides */}
        <section className="mb-16">
          <div className="flex items-center space-x-2 mb-8">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">All Visa Guides</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allGuides.map((guide, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{guide.flag}</span>
                        <div>
                          <Badge variant="outline" className="text-xs mb-2">
                            {guide.category}
                          </Badge>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {guide.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{guide.publishDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{guide.readTime}</span>
                      </div>
                    </div>

                    <Link to={`/guides/${guide.slug}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start p-0 h-auto text-primary hover:text-primary-light">
                        Read Guide →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section>
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get the latest visa updates, new guides, and travel tips delivered to your inbox. 
                Never miss important changes to visa requirements.
              </p>
              <div className="flex max-w-md mx-auto space-x-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
                <Button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                  Subscribe
                </Button>
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