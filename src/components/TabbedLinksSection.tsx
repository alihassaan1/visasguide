import { useCountries } from "@/hooks/useSharedData";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Globe, Map, FileCheck, BookOpen, ChevronRight } from "lucide-react";
const exploreVisaBg = "https://cdn.visas.guide/assets/explore-visa-bg.jpg";

type TabKey = "destinations" | "regions" | "visa-types" | "resources";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "destinations", label: "Top Destinations", icon: Globe },
  { key: "regions", label: "By Region", icon: Map },
  { key: "visa-types", label: "Visa Types", icon: FileCheck },
  { key: "resources", label: "Resources", icon: BookOpen },
];

const regionData = [
  { name: "Europe", slug: "europe", count: 44, emoji: "🇪🇺" },
  { name: "Asia", slug: "asia", count: 48, emoji: "🌏" },
  { name: "North America", slug: "north-america", count: 23, emoji: "🌎" },
  { name: "South America", slug: "south-america", count: 12, emoji: "🌎" },
  { name: "Africa", slug: "africa", count: 54, emoji: "🌍" },
  { name: "Oceania", slug: "oceania", count: 14, emoji: "🌏" },
  { name: "Middle East", slug: "middle-east", count: 17, emoji: "🕌" },
  { name: "Caribbean", slug: "caribbean", count: 13, emoji: "🏝️" },
];

const visaTypes = [
  { name: "Tourist Visa", slug: "tourist-visa", description: "For leisure travel", icon: "✈️", color: "from-blue-500 to-cyan-500" },
  { name: "Business Visa", slug: "business-visa", description: "For business trips", icon: "💼", color: "from-emerald-500 to-teal-500" },
  { name: "Student Visa", slug: "student-visa", description: "For studying abroad", icon: "🎓", color: "from-purple-500 to-violet-500" },
  { name: "Work Visa", slug: "work-visa", description: "For employment", icon: "👔", color: "from-orange-500 to-amber-500" },
  { name: "Transit Visa", slug: "transit-visa", description: "For layovers", icon: "🔄", color: "from-pink-500 to-rose-500" },
  { name: "eVisa", slug: "evisa", description: "Online applications", icon: "📱", color: "from-indigo-500 to-blue-500" },
  { name: "Visa on Arrival", slug: "visa-on-arrival", description: "At destination", icon: "🛬", color: "from-teal-500 to-green-500" },
  { name: "Visa-Free", slug: "visa-free", description: "No visa needed", icon: "🎉", color: "from-green-500 to-emerald-500" },
];

const resources = [
  { name: "Schengen Visa Guide", slug: "schengen-visa-guide", description: "Complete guide to 29 countries", icon: "🇪🇺" },
  { name: "Passport Rankings", slug: "passport-index", description: "Global passport power index", icon: "🏆" },
  { name: "Visa Search", slug: "visa-search", description: "Interactive world map", icon: "🗺️" },
  { name: "Travel Blog", slug: "blog", description: "Tips, news & guides", icon: "📰" },
  { name: "Processing Times", slug: "processing-times", description: "Visa wait times", icon: "⏱️" },
  { name: "Contact Us", slug: "contact", description: "Get expert help", icon: "💬" },
];

const TabbedLinksSection = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("destinations");

  const { data: allCountries } = useCountries();
  const topCountries = [...(allCountries || [])]
    .sort((a, b) => (b.visa_free_destinations || 0) - (a.visa_free_destinations || 0))
    .slice(0, 24);

  const renderContent = () => {
    switch (activeTab) {
      case "destinations":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topCountries.map((country) => (
              <Link
                key={country.slug}
                to={`/countries/${country.slug}`}
                className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 hover:border-primary/50 hover:bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{country.flag_emoji || "🏳️"}</span>
                  <span className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                    {country.name}
                  </span>
                </div>
                {country.visa_free_destinations && country.visa_free_destinations > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {country.visa_free_destinations} visa-free
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        );

      case "regions":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {regionData.map((region) => (
              <Link
                key={region.slug}
                to={`/countries?region=${region.slug}`}
                className="group relative overflow-hidden bg-gradient-to-br from-card to-muted border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-2 right-2 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                  {region.emoji}
                </div>
                <span className="text-3xl mb-3 block">{region.emoji}</span>
                <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                  {region.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {region.count} countries
                </p>
                <ChevronRight className="absolute bottom-4 right-4 w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        );

      case "visa-types":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visaTypes.map((type) => (
              <Link
                key={type.slug}
                to={`/visa-types/${type.slug}`}
                className="group relative overflow-hidden bg-card border border-border rounded-2xl p-5 hover:shadow-xl transition-all duration-300"
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br",
                  type.color
                )} />
                <span className="text-3xl mb-3 block">{type.icon}</span>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {type.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {type.description}
                </p>
              </Link>
            ))}
          </div>
        );

      case "resources":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <Link
                key={resource.slug}
                to={`/${resource.slug}`}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-xl transition-all duration-300 flex items-start gap-4"
              >
                <span className="text-3xl flex-shrink-0">{resource.icon}</span>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {resource.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resource.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={exploreVisaBg} 
          alt="" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Explore Visa Information
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive visa guides, requirements, and travel resources for 200+ destinations worldwide
          </p>
        </div>

        {/* Enhanced Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm font-medium transition-all duration-300",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/30"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-[280px] animate-in fade-in duration-300">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default TabbedLinksSection;
