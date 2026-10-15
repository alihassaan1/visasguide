import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

const guides = [
  {
    title: "US ESTA Application: Complete Step-by-Step Guide 2024",
    excerpt: "Everything you need to know about applying for ESTA authorization to visit the United States as a tourist or business traveler.",
    category: "United States",
    readTime: "8 min read",
    publishDate: "Dec 15, 2024",
    isNew: true,
    image: "🇺🇸"
  },
  {
    title: "Schengen Visa Requirements: Documents Checklist",
    excerpt: "Complete documentation requirements and tips for a successful Schengen visa application to visit European Union countries.",
    category: "Europe", 
    readTime: "12 min read",
    publishDate: "Dec 12, 2024",
    isNew: true,
    image: "🇪🇺"
  },
  {
    title: "UK Visitor Visa: Processing Times and Success Tips",
    excerpt: "Current processing times, requirements, and expert tips to increase your chances of UK visitor visa approval.",
    category: "United Kingdom",
    readTime: "10 min read", 
    publishDate: "Dec 10, 2024",
    isNew: false,
    image: "🇬🇧"
  },
  {
    title: "Canada eTA vs Visitor Visa: Which Do You Need?",
    excerpt: "Understanding the difference between eTA and visitor visa for Canada, and determining which authorization you need.",
    category: "Canada",
    readTime: "6 min read",
    publishDate: "Dec 8, 2024", 
    isNew: false,
    image: "🇨🇦"
  },
  {
    title: "Australia ETA Application: Quick Guide for Tourists", 
    excerpt: "Fast-track your Australia travel with our ETA application guide, including eligibility requirements and application process.",
    category: "Australia",
    readTime: "5 min read",
    publishDate: "Dec 5, 2024",
    isNew: false,
    image: "🇦🇺"
  },
  {
    title: "Japan Tourist Visa: Everything You Need to Know",
    excerpt: "Complete guide to Japan tourist visa requirements, application process, and what to expect during your visit.",
    category: "Japan", 
    readTime: "9 min read",
    publishDate: "Dec 3, 2024",
    isNew: false,
    image: "🇯🇵"
  }
];

const RecentGuides = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20" id="guides">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Latest Visa Guides & Updates
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our latest visa guides, requirement updates, and expert travel tips
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="space-y-4">
                  {/* Image/Flag Header */}
                  <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 p-8 text-center">
                    <span className="text-4xl">{guide.image}</span>
                    {guide.isNew && (
                      <Badge className="absolute top-3 right-3 bg-visa-success text-white">
                        New
                      </Badge>
                    )}
                  </div>

                  <div className="p-6 pt-0">
                    {/* Category and Meta */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {guide.category}
                      </Badge>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{guide.publishDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{guide.readTime}</span>
                        </div>
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

                    {/* Read More */}
                    <Link 
                      to={`/guides/${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="flex items-center space-x-2 text-sm text-primary hover:text-primary-light transition-colors font-medium group-hover:translate-x-1 transform duration-200"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/guides">
            <button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
              View All Guides
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentGuides;