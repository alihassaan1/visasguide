import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Import local destination images
import angolaImg from "@/assets/destinations/angola.jpg";
import polandImg from "@/assets/destinations/poland.jpg";
import hungaryImg from "@/assets/destinations/hungary.jpg";
import slovakiaImg from "@/assets/destinations/slovakia.jpg";
import lithuaniaImg from "@/assets/destinations/lithuania.jpg";
import sloveniaImg from "@/assets/destinations/slovenia.jpg";
import southKoreaImg from "@/assets/destinations/south-korea.jpg";
import icelandImg from "@/assets/destinations/iceland.jpg";
import southSudanImg from "@/assets/destinations/south-sudan.jpg";
import ivoryCoastImg from "@/assets/destinations/ivory-coast.jpg";
import japanImg from "@/assets/destinations/japan.jpg";
import canadaImg from "@/assets/destinations/canada.jpg";

// Country landmark images - local imports for generated images, Unsplash for common ones
const countryImages: Record<string, string> = {
  // Generated local images
  "angola": angolaImg,
  "poland": polandImg,
  "hungary": hungaryImg,
  "slovakia": slovakiaImg,
  "lithuania": lithuaniaImg,
  "slovenia": sloveniaImg,
  "south-korea": southKoreaImg,
  "korea-south": southKoreaImg,
  "iceland": icelandImg,
  "south-sudan": southSudanImg,
  "ivory-coast": ivoryCoastImg,
  "cote-d-ivoire": ivoryCoastImg,
  "japan": japanImg,
  "canada": canadaImg,
  // Reliable Unsplash URLs for other popular destinations
  "united-states": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&h=500&fit=crop&q=80",
  "united-kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=500&fit=crop&q=80",
  "united-arab-emirates": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=500&fit=crop&q=80",
  "france": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=500&fit=crop&q=80",
  "germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=500&fit=crop&q=80",
  "australia": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400&h=500&fit=crop&q=80",
  "italy": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=500&fit=crop&q=80",
  "spain": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=500&fit=crop&q=80",
  "thailand": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=500&fit=crop&q=80",
  "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=500&fit=crop&q=80",
  "india": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=500&fit=crop&q=80",
  "china": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=500&fit=crop&q=80",
  "brazil": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=500&fit=crop&q=80",
  "mexico": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=500&fit=crop&q=80",
  "netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=500&fit=crop&q=80",
  "switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&h=500&fit=crop&q=80",
  "portugal": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=500&fit=crop&q=80",
  "greece": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=500&fit=crop&q=80",
  "turkey": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=500&fit=crop&q=80",
  "egypt": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&h=500&fit=crop&q=80",
  "south-africa": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&h=500&fit=crop&q=80",
  "new-zealand": "https://images.unsplash.com/photo-1469521669194-babb45599def?w=400&h=500&fit=crop&q=80",
  "russia": "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&h=500&fit=crop&q=80",
  "austria": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=500&fit=crop&q=80",
  "belgium": "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=400&h=500&fit=crop&q=80",
  "ireland": "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=400&h=500&fit=crop&q=80",
  "sweden": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&h=500&fit=crop&q=80",
  "norway": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=500&fit=crop&q=80",
  "denmark": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=500&fit=crop&q=80",
  "finland": "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=400&h=500&fit=crop&q=80",
  "czech-republic": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=500&fit=crop&q=80",
  "malaysia": "https://images.unsplash.com/photo-1508062878650-88b52897f298?w=400&h=500&fit=crop&q=80",
  "vietnam": "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=400&h=500&fit=crop&q=80",
  "indonesia": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=500&fit=crop&q=80",
  "philippines": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=500&fit=crop&q=80",
};

// Default travel image
const defaultImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=500&fit=crop&q=80";

const DestinationCarousel = () => {
  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ["carousel-destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select(`
          id,
          name,
          code,
          slug,
          flag_emoji,
          visa_free_destinations,
          search_stats(search_count, page_view_count)
        `)
        .order("search_stats(page_view_count)", { ascending: false })
        .limit(12);

      if (error) throw error;

      return (data || [])
        .map((c) => ({
          ...c,
          totalActivity:
            (c.search_stats?.[0]?.search_count || 0) +
            (c.search_stats?.[0]?.page_view_count || 0),
          image: countryImages[c.slug] || defaultImage,
        }))
        .sort((a, b) => b.totalActivity - a.totalActivity);
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-muted rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground mt-1">
              Explore visa requirements for top travel destinations
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
          {destinations.slice(0, 12).map((destination) => (
            <Link key={destination.id} to={`/countries/${destination.slug}`} className="block group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Background Image */}
                <img
                  src={destination.image}
                  alt={`${destination.name} travel destination`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to default image on error
                    (e.target as HTMLImageElement).src = defaultImage;
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Country Code - Top Left */}
                <div className="absolute top-3 left-3">
                  <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                    {destination.code}
                  </span>
                </div>
                
                {/* Visa Free Badge - Top Right */}
                {destination.visa_free_destinations && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-visa-success/90 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      {destination.visa_free_destinations} visa-free
                    </span>
                  </div>
                )}
                
                {/* Content - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <h3 className="text-white font-bold text-sm md:text-lg leading-tight mb-1 group-hover:text-primary-light transition-colors">
                    {destination.name}
                  </h3>
                  <p className="text-white/70 text-xs md:text-sm">
                    Explore visa info
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
