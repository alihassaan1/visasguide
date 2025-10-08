import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Briefcase, GraduationCap, Heart, Home, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const visaTypes = [
  {
    icon: Plane,
    title: "Tourist Visa",
    description: "Perfect for short-term leisure travel, vacation, sightseeing, and visiting friends or family. This is the most commonly requested visa type worldwide, suitable for tourism and recreational purposes.",
    duration: "Usually 30-90 days",
    popularity: "Most Popular",
    color: "text-visa-info",
    link: "/visa-types/tourist"
  },
  {
    icon: Briefcase, 
    title: "Business Visa",
    description: "Designed for attending business meetings, conferences, trade shows, negotiations, and other commercial activities. Allows you to conduct business but not work or receive payment from local sources.",
    duration: "30-180 days",
    popularity: "Common",
    color: "text-primary",
    link: "/visa-types/business"
  },
  {
    icon: GraduationCap,
    title: "Student Visa", 
    description: "Required for studying at educational institutions, universities, colleges, and academic programs abroad. Includes full-time students, exchange students, and those enrolled in language courses.",
    duration: "Duration of study",
    popularity: "Popular",
    color: "text-accent",
    link: "/visa-types/student"
  },
  {
    icon: Briefcase,
    title: "Work Visa",
    description: "Essential for employment-based immigration and legal work authorization abroad. Allows you to work for a specific employer or in a particular industry, with duration varying based on employment contract.",
    duration: "1-5 years typically",
    popularity: "In Demand",
    color: "text-green-600",
    link: "/guides"
  },
  {
    icon: Heart,
    title: "Family Visa",
    description: "Enables you to join your spouse, partner, children, or family members who are already residing abroad as citizens or permanent residents. Requirements vary significantly by country and relationship type.",
    duration: "Varies by country", 
    popularity: "Common",
    color: "text-orange-600",
    link: "/guides"
  },
  {
    icon: Home,
    title: "Transit Visa",
    description: "Required for short layovers and connections when passing through international airports. Typically allows you to stay in the airport's international zone or transit area without entering the country.",
    duration: "24-96 hours",
    popularity: "Specific Use", 
    color: "text-muted-foreground",
    link: "/guides"
  }
];

const VisaTypes = () => {
  return (
    <section className="py-20" id="visa-types">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Types of Travel Visas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Understanding different visa categories to help you choose the right one for your travel purpose
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visaTypes.map((visa, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Icon and Title */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-muted/50 ${visa.color}`}>
                        <visa.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{visa.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{visa.duration}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${visa.popularity === 'Most Popular' ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                    >
                      {visa.popularity}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {visa.description}
                  </p>

                  {/* CTA */}
                  <div className="pt-2">
                    <Link 
                      to={visa.link}
                      className="text-sm text-primary hover:text-primary-light transition-colors font-medium group-hover:translate-x-1 transform duration-200 block"
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="font-semibold text-foreground mb-2">Need Help Choosing?</h3>
              <p className="text-muted-foreground mb-4">
                Not sure which visa type you need? Our interactive visa finder can help you determine 
                the right visa category based on your travel purpose and destination.
              </p>
              <Link to="/visa-finder">
                <button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                  Use Visa Finder Tool
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default VisaTypes;