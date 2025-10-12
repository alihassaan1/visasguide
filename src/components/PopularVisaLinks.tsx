import { Link } from "react-router-dom";
import { countryCodeToFlagEmoji } from "@/lib/utils";

interface VisaDestination {
  name: string;
  code: string;
  slug: string;
  keyword: string; // SEO keyword like "US Visa", "Canada Visa"
}

const popularDestinations: VisaDestination[] = [
  { name: "United States", code: "US", slug: "united-states", keyword: "US Visa" },
  { name: "Canada", code: "CA", slug: "canada", keyword: "Canada Visa" },
  { name: "United Kingdom", code: "GB", slug: "united-kingdom", keyword: "UK Visa" },
  { name: "Australia", code: "AU", slug: "australia", keyword: "Australia Visa" },
  { name: "Germany", code: "DE", slug: "germany", keyword: "Germany Visa" },
  { name: "France", code: "FR", slug: "france", keyword: "France Visa" },
  { name: "Japan", code: "JP", slug: "japan", keyword: "Japan Visa" },
  { name: "China", code: "CN", slug: "china", keyword: "China Visa" },
  { name: "United Arab Emirates", code: "AE", slug: "united-arab-emirates", keyword: "UAE Visa" },
  { name: "Singapore", code: "SG", slug: "singapore", keyword: "Singapore Visa" },
  { name: "India", code: "IN", slug: "india", keyword: "India Visa" },
  { name: "Thailand", code: "TH", slug: "thailand", keyword: "Thailand Visa" },
  { name: "Spain", code: "ES", slug: "spain", keyword: "Spain Visa" },
  { name: "Italy", code: "IT", slug: "italy", keyword: "Italy Visa" },
  { name: "Netherlands", code: "NL", slug: "netherlands", keyword: "Netherlands Visa" },
  { name: "Switzerland", code: "CH", slug: "switzerland", keyword: "Switzerland Visa" },
  { name: "New Zealand", code: "NZ", slug: "new-zealand", keyword: "New Zealand Visa" },
  { name: "South Korea", code: "KR", slug: "south-korea", keyword: "South Korea Visa" },
];

const PopularVisaLinks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Travel Visa Requirements for Popular Destinations
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore visa requirements, application procedures, and essential travel information for the world's most visited countries.
            </p>
          </div>

          {/* Grid of Visa Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularDestinations.map((destination) => (
              <Link
                key={destination.code}
                to={`/countries/${destination.slug}`}
                className="group flex flex-col items-center justify-center p-6 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all duration-300"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {countryCodeToFlagEmoji(destination.code)}
                </div>
                <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors">
                  {destination.keyword}
                </span>
              </Link>
            ))}
          </div>

          {/* View All Link */}
          <div className="text-center mt-10">
            <Link 
              to="/countries" 
              className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-base group"
            >
              View all countries
              <svg 
                className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularVisaLinks;
