import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Country {
  id: string;
  name: string;
  code: string;
  slug: string;
  flag_emoji: string;
}

interface WorldVisaMapProps {
  countries: Country[];
  onCountryClick?: (country: Country) => void;
  apiKey?: string;
}

const WorldVisaMap: React.FC<WorldVisaMapProps> = ({ countries, onCountryClick, apiKey }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !apiKey) return;

    mapboxgl.accessToken = apiKey;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [20, 20],
      zoom: 1.5,
      projection: 'mercator' as any,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Create popup
    popup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add country boundaries source
      map.current.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      });

      // Add country fill layer
      map.current.addLayer({
        id: 'country-fills',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#3b82f6',
            '#e5e7eb'
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.8,
            0.6
          ],
        },
      });

      // Add country borders
      map.current.addLayer({
        id: 'country-borders',
        type: 'line',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#94a3b8',
          'line-width': 1,
        },
      });

      // Hover effect
      let hoveredStateId: string | number | null = null;

      map.current.on('mousemove', 'country-fills', (e) => {
        if (!map.current) return;
        
        if (e.features && e.features.length > 0) {
          if (hoveredStateId !== null) {
            map.current.setFeatureState(
              { source: 'countries', sourceLayer: 'country_boundaries', id: hoveredStateId },
              { hover: false }
            );
          }

          hoveredStateId = e.features[0].id!;
          const countryCode = e.features[0].properties?.iso_3166_1;
          const countryName = e.features[0].properties?.name_en;

          map.current.setFeatureState(
            { source: 'countries', sourceLayer: 'country_boundaries', id: hoveredStateId },
            { hover: true }
          );

          setHoveredCountry(countryName);

          // Show popup
          if (popup.current) {
            popup.current
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold text-sm">${countryName}</h3>
                  <p class="text-xs text-muted-foreground">Click to view visa requirements</p>
                </div>
              `)
              .addTo(map.current);
          }
        }
      });

      map.current.on('mouseleave', 'country-fills', () => {
        if (!map.current) return;
        
        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: 'countries', sourceLayer: 'country_boundaries', id: hoveredStateId },
            { hover: false }
          );
        }
        hoveredStateId = null;
        setHoveredCountry(null);
        
        if (popup.current) {
          popup.current.remove();
        }
      });

      // Click handler
      map.current.on('click', 'country-fills', (e) => {
        if (e.features && e.features.length > 0) {
          const countryCode = e.features[0].properties?.iso_3166_1;
          const country = countries.find(c => c.code === countryCode);
          
          if (country) {
            setSelectedCountry(country);
            if (onCountryClick) {
              onCountryClick(country);
            }
          }
        }
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'country-fills', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'country-fills', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [countries, onCountryClick, apiKey]);

  return (
    <div className="relative w-full h-[600px] sm:h-[700px] lg:h-[800px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-3 sm:p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm sm:text-base">Interactive Visa Map</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Hover over countries to see details. Click to view visa requirements.
        </p>
        {hoveredCountry && (
          <div className="mt-2 pt-2 border-t">
            <Badge variant="outline" className="text-xs">{hoveredCountry}</Badge>
          </div>
        )}
      </div>

      {/* Selected country card */}
      {selectedCountry && (
        <Card className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-2xl">{selectedCountry.flag_emoji}</span>
                {selectedCountry.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCountry(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              View detailed visa requirements for {selectedCountry.name}
            </p>
            <Link to={`/countries/${selectedCountry.slug}`}>
              <Button className="w-full text-sm">
                View Visa Requirements
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorldVisaMap;
