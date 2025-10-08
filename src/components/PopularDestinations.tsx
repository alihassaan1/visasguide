import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const destinations = [
  {
    country: "United States",
    flag: "🇺🇸",
    visaType: "ESTA/B1-B2",
    processingTime: "1-3 days",
    difficulty: "Medium",
    monthlySearches: "2.3M"
  },
  {
    country: "United Kingdom", 
    flag: "🇬🇧",
    visaType: "Standard Visitor",
    processingTime: "3-8 weeks",
    difficulty: "Medium",
    monthlySearches: "1.8M"
  },
  {
    country: "Schengen Area",
    flag: "🇪🇺", 
    visaType: "Schengen Visa",
    processingTime: "10-15 days",
    difficulty: "Medium",
    monthlySearches: "1.5M"
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    visaType: "ETA/Visitor",
    processingTime: "1-2 days",
    difficulty: "Easy",
    monthlySearches: "980k"
  },
  {
    country: "Canada",
    flag: "🇨🇦", 
    visaType: "eTA/Visitor",
    processingTime: "Minutes-weeks",
    difficulty: "Medium",
    monthlySearches: "1.2M"
  },
  {
    country: "Japan",
    flag: "🇯🇵",
    visaType: "Tourist/Business",
    processingTime: "5-10 days", 
    difficulty: "Easy",
    monthlySearches: "850k"
  }
];

const PopularDestinations = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30" id="destinations">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Popular Travel Destinations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get visa information for the most searched travel destinations worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{destination.flag}</span>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {destination.country}
                        </h3>
                        <p className="text-sm text-muted-foreground">{destination.visaType}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={destination.difficulty === "Easy" ? "default" : "secondary"}
                      className={destination.difficulty === "Easy" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"}
                    >
                      {destination.difficulty}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-visa-info" />
                      <span className="text-muted-foreground">Processing: {destination.processingTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-visa-warning" />
                      <span className="text-muted-foreground">{destination.monthlySearches} monthly searches</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <Link 
                      to={`/countries/${destination.country.toLowerCase().replace(/\s+/g, '-')}`}
                      className="w-full text-left text-sm text-primary hover:text-primary-light transition-colors font-medium block"
                    >
                      View Requirements →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;