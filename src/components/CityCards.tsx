import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface CityCardsProps {
  countryId: string;
  countrySlug: string;
  countryName: string;
}

// Curated city images for popular destinations
const cityImageMap: Record<string, string> = {
  // Indonesia
  "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop",
  "jakarta": "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&h=600&fit=crop",
  "yogyakarta": "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800&h=600&fit=crop",
  "surabaya": "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&h=600&fit=crop",
  "bandung": "https://images.unsplash.com/photo-1594230700347-e0f2e6f0a284?w=800&h=600&fit=crop",
  // Thailand
  "bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop",
  "chiang-mai": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop",
  "phuket": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop",
  "pattaya": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop",
  // Japan
  "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
  "osaka": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=600&fit=crop",
  "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop",
  // UAE
  "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
  "abu-dhabi": "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&h=600&fit=crop",
  // Singapore
  "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop",
  // Malaysia
  "kuala-lumpur": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop",
  "penang": "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&h=600&fit=crop",
  // India
  "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop",
  "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop",
  "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop",
  // France
  "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  "nice": "https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=800&h=600&fit=crop",
  // UK
  "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
  "edinburgh": "https://images.unsplash.com/photo-1506377585622-bedcbb5f4f6f?w=800&h=600&fit=crop",
  // USA
  "new-york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
  "los-angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&h=600&fit=crop",
  "miami": "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&h=600&fit=crop",
  // Australia
  "sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop",
  "melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop",
  // Italy
  "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
  "venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop",
  "milan": "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=800&h=600&fit=crop",
  // Spain
  "barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
  "madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
  // Germany
  "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop",
  "munich": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop",
  // South Korea
  "seoul": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=600&fit=crop",
  "busan": "https://images.unsplash.com/photo-1578037571214-25e07ed4a8e2?w=800&h=600&fit=crop",
  // Turkey
  "istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop",
  // Egypt
  "cairo": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop",
  // Brazil
  "rio-de-janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop",
  "sao-paulo": "https://images.unsplash.com/photo-1554168848-228a5e76f888?w=800&h=600&fit=crop",
  // Mexico
  "mexico-city": "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&h=600&fit=crop",
  "cancun": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&h=600&fit=crop",
  // Canada
  "toronto": "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&h=600&fit=crop",
  "vancouver": "https://images.unsplash.com/photo-1559511260-66a68eb3a834?w=800&h=600&fit=crop",
  // China
  "beijing": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop",
  "shanghai": "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&h=600&fit=crop",
  "hong-kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=600&fit=crop",
};

// Generate a consistent gradient based on city name
const getCityGradient = (cityName: string): string => {
  const gradients = [
    "from-blue-600/80 to-purple-600/80",
    "from-emerald-600/80 to-teal-600/80",
    "from-orange-600/80 to-red-600/80",
    "from-pink-600/80 to-rose-600/80",
    "from-indigo-600/80 to-blue-600/80",
    "from-cyan-600/80 to-blue-600/80",
    "from-amber-600/80 to-orange-600/80",
    "from-violet-600/80 to-purple-600/80",
  ];
  const hash = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};

const getCityImage = (city: { slug: string; name: string; hero_image_url?: string | null }): string | null => {
  // First check if city has a stored hero image
  if (city.hero_image_url) {
    return city.hero_image_url;
  }
  
  // Check curated image map
  const curatedImage = cityImageMap[city.slug.toLowerCase()];
  if (curatedImage) {
    return curatedImage;
  }
  
  // Return null to use gradient fallback
  return null;
};

const CityCards = ({ countryId, countrySlug, countryName }: CityCardsProps) => {
  const hasTriggeredGeneration = useRef(false);

  const { data: cities, isLoading, refetch } = useQuery({
    queryKey: ['country-cities', countryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('country_id', countryId)
        .eq('is_featured', true)
        .order('is_capital', { ascending: false })
        .order('population', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!countryId
  });

  // Auto-generate cities if none exist
  useEffect(() => {
    if (!isLoading && cities && cities.length === 0 && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true;
      supabase.functions.invoke('generate-city-content', {
        body: { 
          countryId,
          countryName,
          generateCities: true
        }
      }).then(() => {
        // Refetch after generation
        setTimeout(() => refetch(), 3000);
      }).catch(() => {});
    }
  }, [cities, isLoading, countryId, countryName, refetch]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!cities || cities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Popular Cities in {countryName}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {cities.map((city) => {
            const imageUrl = getCityImage(city);
            const gradient = getCityGradient(city.name);
            
            return (
              <Link 
                key={city.id} 
                to={`/${countrySlug}/${city.slug}`}
                className="group"
              >
                <div 
                  className={`relative h-28 rounded-lg overflow-hidden ${!imageUrl ? `bg-gradient-to-br ${gradient}` : ''}`}
                  style={imageUrl ? {
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-colors" />
                  
                  {city.is_capital && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500/90 text-yellow-950 text-xs py-0">
                      <Star className="h-2.5 w-2.5 mr-0.5" /> Capital
                    </Badge>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <h4 className="font-semibold text-white text-sm truncate">{city.name}</h4>
                    <p className="text-white/70 text-xs flex items-center gap-1 group-hover:text-white transition-colors">
                      Explore tours <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CityCards;
