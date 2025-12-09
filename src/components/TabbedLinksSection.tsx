import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type TabKey = "destinations" | "regions" | "visa-types" | "resources";

const tabs: { key: TabKey; label: string }[] = [
  { key: "destinations", label: "Top Destinations" },
  { key: "regions", label: "By Region" },
  { key: "visa-types", label: "Visa Types" },
  { key: "resources", label: "Resources" },
];

const regionData = [
  { name: "Europe", slug: "europe", count: 44 },
  { name: "Asia", slug: "asia", count: 48 },
  { name: "North America", slug: "north-america", count: 23 },
  { name: "South America", slug: "south-america", count: 12 },
  { name: "Africa", slug: "africa", count: 54 },
  { name: "Oceania", slug: "oceania", count: 14 },
  { name: "Middle East", slug: "middle-east", count: 17 },
  { name: "Caribbean", slug: "caribbean", count: 13 },
];

const visaTypes = [
  { name: "Tourist Visa", slug: "tourist-visa", description: "For leisure travel" },
  { name: "Business Visa", slug: "business-visa", description: "For business trips" },
  { name: "Student Visa", slug: "student-visa", description: "For studying abroad" },
  { name: "Work Visa", slug: "work-visa", description: "For employment" },
  { name: "Transit Visa", slug: "transit-visa", description: "For layovers" },
  { name: "eVisa", slug: "evisa", description: "Online applications" },
  { name: "Visa on Arrival", slug: "visa-on-arrival", description: "At destination" },
  { name: "Visa-Free", slug: "visa-free", description: "No visa needed" },
];

const resources = [
  { name: "Schengen Visa Guide", slug: "schengen-visa-guide", description: "Complete guide" },
  { name: "Passport Rankings", slug: "passport-index", description: "Global index" },
  { name: "Visa Search", slug: "visa-search", description: "Interactive map" },
  { name: "Travel Blog", slug: "blog", description: "Tips & news" },
  { name: "Processing Times", slug: "processing-times", description: "Wait times" },
  { name: "Contact Us", slug: "contact", description: "Get help" },
];

const TabbedLinksSection = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("destinations");

  const { data: topCountries = [] } = useQuery({
    queryKey: ["top-countries-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("name, slug, visa_free_destinations")
        .order("visa_free_destinations", { ascending: false })
        .limit(24);
      if (error) throw error;
      return data || [];
    },
  });

  const renderContent = () => {
    switch (activeTab) {
      case "destinations":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2">
            {topCountries.map((country) => (
              <Link
                key={country.slug}
                to={`/countries/${country.slug}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors py-1 flex items-center justify-between group"
              >
                <span className="truncate">{country.name}</span>
                {country.visa_free_destinations && (
                  <span className="text-xs text-muted-foreground/60 ml-1 group-hover:text-primary/60">
                    ({country.visa_free_destinations})
                  </span>
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
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {region.name}
                </span>
                <span className="text-xs text-muted-foreground block mt-1">
                  {region.count} countries
                </span>
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
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {type.name}
                </span>
                <span className="text-xs text-muted-foreground block mt-1">
                  {type.description}
                </span>
              </Link>
            ))}
          </div>
        );

      case "resources":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {resources.map((resource) => (
              <Link
                key={resource.slug}
                to={`/${resource.slug}`}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all group text-center"
              >
                <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                  {resource.name}
                </span>
                <span className="text-xs text-muted-foreground block mt-1">
                  {resource.description}
                </span>
              </Link>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
          Explore Visa Information
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          {renderContent()}
        </div>
      </div>
    </section>
  );
};

export default TabbedLinksSection;
