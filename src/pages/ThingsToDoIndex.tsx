import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { thingsToDoData } from "@/data/thingsToDo";

const ThingsToDoIndex = () => {

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Things to Do Around the World: Top Destination Guides (2026)"
        description="Browse expert guides to the best attractions, activities, and tours in the world's most popular destinations — from the Dominican Republic to Singapore."
        canonical="https://visas.guide/things-to-do"
      />
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Things to Do: Destination Guides
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked attractions, travel tips, and bookable tours for the world's top destinations.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {thingsToDoData.map((d) => (
            <Link key={d.slug} to={`/things-to-do/${d.slug}`}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <MapPin className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-wide font-semibold">
                      Destination Guide
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    Things to Do in {d.country}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Top 10 attractions, best time to visit, tips & FAQs.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThingsToDoIndex;
