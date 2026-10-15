import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface CityCardsProps {
  countryId: string;
  countrySlug: string;
  countryName: string;
}

// Curated city images for popular destinations - using high quality Pexels/Unsplash images
const cityImageMap: Record<string, string> = {
  // UAE - Updated with better images
  "dubai": "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop", // Burj Khalifa skyline
  "abu-dhabi": "https://images.unsplash.com/photo-1558717091-f072b5bab52a?w=800&h=600&fit=crop", // Sheikh Zayed Mosque
  "sharjah": "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=800&h=600&fit=crop", // Sharjah waterfront
  "ajman": "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&h=600&fit=crop", // Beach/coast
  "ras-al-khaimah": "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop", // Desert mountains
  "fujairah": "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=800&h=600&fit=crop", // Mountain coastline
  
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
  "krabi": "https://images.unsplash.com/photo-1552659546-1d2e2ace8c7c?w=800&h=600&fit=crop",
  
  // Japan
  "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
  "osaka": "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&h=600&fit=crop",
  "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop",
  "yokohama": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&h=600&fit=crop",
  "hiroshima": "https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=800&h=600&fit=crop",
  
  // Qatar
  "doha": "https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=800&h=600&fit=crop",
  
  // Saudi Arabia
  "riyadh": "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&h=600&fit=crop",
  "jeddah": "https://images.unsplash.com/photo-1578681041175-9717c638e22f?w=800&h=600&fit=crop",
  "mecca": "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=600&fit=crop",
  "medina": "https://images.unsplash.com/photo-1565019001607-0aa4a5c9f723?w=800&h=600&fit=crop",
  
  // Vietnam
  "hanoi": "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=800&h=600&fit=crop",
  "ho-chi-minh-city": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop",
  "da-nang": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop",
  "hoi-an": "https://images.unsplash.com/photo-1536086845133-67c4e9a88e09?w=800&h=600&fit=crop",
  
  // Singapore
  "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop",
  
  // Malaysia
  "kuala-lumpur": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop",
  "penang": "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&h=600&fit=crop",
  "langkawi": "https://images.unsplash.com/photo-1609946860441-a51ffcf22208?w=800&h=600&fit=crop",
  
  // India
  "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop",
  "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop",
  "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop",
  "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop",
  "bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop",
  "agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop",
  
  // France
  "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
  "nice": "https://images.unsplash.com/photo-1491166617655-0723a0999cfc?w=800&h=600&fit=crop",
  "lyon": "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=600&fit=crop",
  "marseille": "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop",
  
  // UK
  "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
  "edinburgh": "https://images.unsplash.com/photo-1506377585622-bedcbb5f4f6f?w=800&h=600&fit=crop",
  "manchester": "https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=800&h=600&fit=crop",
  "birmingham": "https://images.unsplash.com/photo-1520980255636-2c2a21c7eb0d?w=800&h=600&fit=crop",
  
  // USA
  "new-york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
  "los-angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&h=600&fit=crop",
  "miami": "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&h=600&fit=crop",
  "las-vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&h=600&fit=crop",
  "san-francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
  "chicago": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&h=600&fit=crop",
  
  // Australia
  "sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop",
  "melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop",
  "brisbane": "https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=800&h=600&fit=crop",
  "perth": "https://images.unsplash.com/photo-1573935448851-bf1e6f451a13?w=800&h=600&fit=crop",
  
  // Italy
  "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
  "venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop",
  "milan": "https://images.unsplash.com/photo-1520440229-6469a149ac59?w=800&h=600&fit=crop",
  "florence": "https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?w=800&h=600&fit=crop",
  
  // Spain
  "barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop",
  "madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop",
  "seville": "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&h=600&fit=crop",
  "valencia": "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=600&fit=crop",
  
  // Germany
  "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop",
  "munich": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop",
  "frankfurt": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop",
  "hamburg": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
  
  // South Korea
  "seoul": "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&h=600&fit=crop",
  "busan": "https://images.unsplash.com/photo-1578037571214-25e07ed4a8e2?w=800&h=600&fit=crop",
  "jeju": "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&h=600&fit=crop",
  
  // Turkey
  "istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop",
  "antalya": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop",
  "cappadocia": "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&h=600&fit=crop",
  
  // Egypt
  "cairo": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop",
  "luxor": "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&h=600&fit=crop",
  "sharm-el-sheikh": "https://images.unsplash.com/photo-1548018560-c7196a0f4447?w=800&h=600&fit=crop",
  
  // Brazil
  "rio-de-janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop",
  "sao-paulo": "https://images.unsplash.com/photo-1554168848-228a5e76f888?w=800&h=600&fit=crop",
  
  // Mexico
  "mexico-city": "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&h=600&fit=crop",
  "cancun": "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&h=600&fit=crop",
  "playa-del-carmen": "https://images.unsplash.com/photo-1589985269740-7d0eb1a3c6a0?w=800&h=600&fit=crop",
  
  // Canada
  "toronto": "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&h=600&fit=crop",
  "vancouver": "https://images.unsplash.com/photo-1559511260-66a68eb3a834?w=800&h=600&fit=crop",
  "montreal": "https://images.unsplash.com/photo-1559587336-4eb38d15c699?w=800&h=600&fit=crop",
  
  // China
  "beijing": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop",
  "shanghai": "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&h=600&fit=crop",
  "hong-kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=600&fit=crop",
  "guangzhou": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop",
  
  // Greece
  "athens": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop",
  "santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
  "mykonos": "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800&h=600&fit=crop",
  
  // Portugal
  "lisbon": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  "porto": "https://images.unsplash.com/photo-1555881400-69009f5c20eb?w=800&h=600&fit=crop",
  
  // Netherlands
  "amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop",
  "rotterdam": "https://images.unsplash.com/photo-1512470876337-0ea260c0db0e?w=800&h=600&fit=crop",
  
  // Austria
  "vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop",
  "salzburg": "https://images.unsplash.com/photo-1595867897093-8b8f1c88582e?w=800&h=600&fit=crop",
  
  // Switzerland
  "zurich": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=600&fit=crop",
  "geneva": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&h=600&fit=crop",
  
  // Czech Republic
  "prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&h=600&fit=crop",
  
  // Hungary
  "budapest": "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=800&h=600&fit=crop",
  
  // Poland
  "warsaw": "https://images.unsplash.com/photo-1607427293702-036933bbf746?w=800&h=600&fit=crop",
  "krakow": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  
  // Russia
  "moscow": "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&h=600&fit=crop",
  "st-petersburg": "https://images.unsplash.com/photo-1556610961-2fecc5927173?w=800&h=600&fit=crop",
  
  // Philippines
  "manila": "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=800&h=600&fit=crop",
  "cebu": "https://images.unsplash.com/photo-1505316065161-4cb8a735a13f?w=800&h=600&fit=crop",
  "boracay": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  
  // South Africa
  "cape-town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop",
  "johannesburg": "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&h=600&fit=crop",
  
  // Morocco
  "marrakech": "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=600&fit=crop",
  "casablanca": "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&h=600&fit=crop",
  
  // Argentina
  "buenos-aires": "https://images.unsplash.com/photo-1518141532615-4305c9f914c9?w=800&h=600&fit=crop",
  
  // Colombia
  "bogota": "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=600&fit=crop",
  "cartagena": "https://images.unsplash.com/photo-1583531172005-763a22401990?w=800&h=600&fit=crop",
  
  // Peru
  "lima": "https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800&h=600&fit=crop",
  "cusco": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop",
  
  // New Zealand
  "auckland": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=600&fit=crop",
  "queenstown": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&h=600&fit=crop",
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
