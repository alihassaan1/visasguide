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
          {cities.map((city) => (
            <Link 
              key={city.id} 
              to={`/${countrySlug}/${city.slug}`}
              className="group"
            >
              <div 
                className="relative h-28 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20"
                style={city.hero_image_url ? {
                  backgroundImage: `url(${city.hero_image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CityCards;
