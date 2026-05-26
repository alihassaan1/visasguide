import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Import local destination images
import uaeImg from "@/assets/destinations/uae.jpg";
import thailandImg from "@/assets/destinations/thailand.jpg";
import indonesiaImg from "@/assets/destinations/indonesia.jpg";
import malaysiaImg from "@/assets/destinations/malaysia.jpg";
import singaporeImg from "@/assets/destinations/singapore.jpg";
import franceImg from "@/assets/destinations/france.jpg";
import japanImg from "@/assets/destinations/japan.jpg";

// Top travel destinations ranked by international arrivals/travel volume
const topDestinations = [
  { name: "United Arab Emirates", slug: "united-arab-emirates", code: "AE", image: uaeImg, visaFree: 180 },
  { name: "Thailand", slug: "thailand", code: "TH", image: thailandImg, visaFree: 35 },
  { name: "Indonesia", slug: "indonesia", code: "ID", image: indonesiaImg, visaFree: 72 },
  { name: "Malaysia", slug: "malaysia", code: "MY", image: malaysiaImg, visaFree: 166 },
  { name: "Singapore", slug: "singapore", code: "SG", image: singaporeImg, visaFree: 195 },
  { name: "France", slug: "france", code: "FR", image: franceImg, visaFree: 190 },
  { name: "Japan", slug: "japan", code: "JP", image: japanImg, visaFree: 193 },
  { name: "Turkey", slug: "turkey", code: "TR", image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=500&fit=crop&q=80", visaFree: 118 },
  { name: "Italy", slug: "italy", code: "IT", image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=500&fit=crop&q=80", visaFree: 190 },
  { name: "Spain", slug: "spain", code: "ES", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=500&fit=crop&q=80", visaFree: 190 },
  { name: "United Kingdom", slug: "united-kingdom", code: "GB", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=500&fit=crop&q=80", visaFree: 187 },
  { name: "United States", slug: "united-states", code: "US", image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&h=500&fit=crop&q=80", visaFree: 186 },
];

// Default travel image
const defaultImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=500&fit=crop&q=80";

const DestinationCarousel = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Top Travel Destinations
            </h2>
            <p className="text-muted-foreground mt-1">
              Most visited countries ranked by travel volume
            </p>
          </div>
          <Link
            to="/countries"
            className="hidden sm:flex items-center text-primary hover:text-primary/80 font-medium text-sm group"
          >
            View All
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid-based layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {topDestinations.map((destination, index) => (
            <Link key={destination.slug} to={`/countries/${destination.slug}`} className="block group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Background Image */}
                <img
                  src={destination.image}
                  alt={`${destination.name} travel destination`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultImage;
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Single subtle rank badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/15 backdrop-blur-md text-white text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/20">
                    #{index + 1}
                  </span>
                </div>

                {/* Content - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="text-white font-semibold text-sm md:text-lg leading-tight mb-0.5 group-hover:text-primary-light transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-white/75 text-[11px] md:text-xs">
                    {destination.visaFree > 0 ? `${destination.visaFree} visa-free entries` : 'Explore visa info'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          to="/countries"
          className="sm:hidden flex items-center justify-center text-primary hover:text-primary/80 font-medium text-sm mt-6 group"
        >
          View All Countries
          <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default DestinationCarousel;
