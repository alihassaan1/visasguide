import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Users, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Countries = () => {
  const popularCountries = [
    {
      country: "United States",
      flag: "🇺🇸",
      visaRequired: true,
      visaType: "ESTA/B1-B2",
      processingTime: "1-3 days",
      fee: "$21 USD",
      difficulty: "Medium",
      monthlySearches: "2.3M",
      description: "Tourist and business travel to the US requires ESTA or B1/B2 visa depending on nationality."
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧", 
      visaRequired: true,
      visaType: "Standard Visitor",
      processingTime: "3-8 weeks",
      fee: "£95-£1,408",
      difficulty: "Medium", 
      monthlySearches: "1.8M",
      description: "Standard visitor visa required for most nationalities visiting the UK for tourism or business."
    },
    {
      country: "Germany",
      flag: "🇩🇪",
      visaRequired: true,
      visaType: "Schengen Visa", 
      processingTime: "10-15 days",
      fee: "€80-€160",
      difficulty: "Medium",
      monthlySearches: "1.5M", 
      description: "Schengen visa allows travel to Germany and 25 other European countries."
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      visaRequired: true,
      visaType: "ETA/Visitor",
      processingTime: "1-2 days", 
      fee: "$20 AUD",
      difficulty: "Easy",
      monthlySearches: "980K",
      description: "Electronic Travel Authority (ETA) or visitor visa required for tourism and business visits."
    },
    {
      country: "Canada", 
      flag: "🇨🇦",
      visaRequired: true,
      visaType: "eTA/Visitor",
      processingTime: "Minutes-weeks",
      fee: "$7-$100 CAD",
      difficulty: "Medium",
      monthlySearches: "1.2M",
      description: "Electronic Travel Authorization (eTA) or visitor visa depending on nationality."
    },
    {
      country: "Japan",
      flag: "🇯🇵",
      visaRequired: false,
      visaType: "Visa-free/Tourist", 
      processingTime: "N/A",
      fee: "Free",
      difficulty: "Easy",
      monthlySearches: "850K",
      description: "Many nationalities can visit Japan visa-free for up to 90 days for tourism."
    }
  ];

  const regions = [
    { name: "North America", count: 3, icon: "🌎" },
    { name: "Europe", count: 27, icon: "🇪🇺" },
    { name: "Asia", count: 15, icon: "🌏" }, 
    { name: "Oceania", count: 4, icon: "🌊" },
    { name: "South America", count: 8, icon: "🌍" },
    { name: "Africa", count: 12, icon: "🌍" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Visa Requirements by Country
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete visa information, requirements, and application guides for travel destinations worldwide
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search for a country or destination..."
              className="pl-10 py-3 text-lg border-2 border-border/50 focus:border-primary"
            />
          </div>
        </div>

        {/* Regions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Browse by Region</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regions.map((region, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">{region.icon}</div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                    {region.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{region.count} countries</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Popular Destinations</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {popularCountries.map((country, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{country.flag}</span>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {country.country}
                          </h3>
                          <p className="text-muted-foreground">{country.visaType}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={country.visaRequired ? "secondary" : "default"}
                        className={!country.visaRequired ? "bg-visa-success text-white" : ""}
                      >
                        {country.visaRequired ? "Visa Required" : "Visa Free"}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {country.description}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-visa-info" />
                        <div>
                          <p className="text-xs text-muted-foreground">Processing Time</p>
                          <p className="text-sm font-medium text-foreground">{country.processingTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-visa-warning" />
                        <div>
                          <p className="text-xs text-muted-foreground">Visa Fee</p>
                          <p className="text-sm font-medium text-foreground">{country.fee}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Difficulty</p>
                          <p className="text-sm font-medium text-foreground">{country.difficulty}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Searches</p>
                          <p className="text-sm font-medium text-foreground">{country.monthlySearches}</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex space-x-2 pt-2">
                      <Link to={`/countries/${country.country.toLowerCase().replace(' ', '-')}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Requirements
                        </Button>
                      </Link>
                      <Link to={`/guides/${country.country.toLowerCase().replace(' ', '-')}-visa-guide`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                          Read Guide
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section>
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <h3 className="text-3xl font-bold text-primary">195+</h3>
                  <p className="text-muted-foreground">Countries Covered</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary">500+</h3>
                  <p className="text-muted-foreground">Visa Guides</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary">24/7</h3>
                  <p className="text-muted-foreground">Updates Monitoring</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary">99%</h3>
                  <p className="text-muted-foreground">Accuracy Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Countries;