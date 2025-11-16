import { Link } from "react-router-dom";
import { Search, TrendingUp, Globe, FileText, Plane, Map } from "lucide-react";
import { Card } from "@/components/ui/card";

const SEOKeywordsSection = () => {
  const keywordCategories = [
    {
      icon: Globe,
      title: "Popular Visa Types",
      keywords: [
        { text: "Schengen Visa Guide", link: "/visa-types/tourist" },
        { text: "US Tourist Visa", link: "/visa-types/tourist" },
        { text: "Dubai Visit Visa", link: "/visa-types/tourist" },
        { text: "UK Visitor Visa", link: "/visa-types/tourist" },
        { text: "Student Visa Guide", link: "/visa-types/student" },
        { text: "Business Visa Requirements", link: "/visa-types/business" },
      ],
    },
    {
      icon: Map,
      title: "Top Destinations",
      keywords: [
        { text: "Europe Visa Requirements", link: "/countries" },
        { text: "Asia Travel Visas", link: "/countries" },
        { text: "USA Visa Application", link: "/countries" },
        { text: "Canada Immigration", link: "/countries" },
        { text: "Australia Visa Guide", link: "/countries" },
        { text: "UK Immigration Rules", link: "/countries" },
      ],
    },
    {
      icon: FileText,
      title: "Visa Resources",
      keywords: [
        { text: "Visa-Free Countries", link: "/visa-free-countries" },
        { text: "eVisa Application", link: "/countries" },
        { text: "Passport Rankings", link: "/passport-rankings" },
        { text: "Visa Processing Times", link: "/processing-times" },
        { text: "Travel Requirements 2025", link: "/countries" },
        { text: "Visa Requirements Checker", link: "/visa-requirements" },
      ],
    },
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Quick Access</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Find What You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quick links to the most searched visa information and travel resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {keywordCategories.map((category) => (
            <Card key={category.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <category.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
              </div>
              <div className="space-y-3">
                {category.keywords.map((keyword) => (
                  <Link
                    key={keyword.text}
                    to={keyword.link}
                    className="block text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3 h-3 opacity-50" />
                      <span className="text-sm">{keyword.text}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SEOKeywordsSection;
