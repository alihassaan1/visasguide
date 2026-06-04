import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Country {
  id: string;
  name: string;
  code: string;
  slug: string;
  flag_emoji: string;
}

// Default Mapbox public token - free tier usage only
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoiaW1ha2UiLCJhIjoiY21peXFwbGR6MGY1djNjczRoY3M5N3NhaiJ9.6Rl3YK4qRdutrx7jzpptXQ';

// Country coordinates for zoom functionality
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  'AF': [67.71, 33.94], 'AL': [20.17, 41.15], 'DZ': [1.66, 28.03], 'AD': [1.60, 42.55],
  'AO': [17.87, -11.20], 'AR': [-63.62, -38.42], 'AM': [45.04, 40.07], 'AU': [133.78, -25.27],
  'AT': [14.55, 47.52], 'AZ': [47.58, 40.14], 'BS': [-77.40, 25.03], 'BH': [50.56, 26.07],
  'BD': [90.36, 23.68], 'BB': [-59.54, 13.19], 'BY': [27.95, 53.71], 'BE': [4.47, 50.50],
  'BZ': [-88.50, 17.19], 'BJ': [2.32, 9.31], 'BT': [90.43, 27.51], 'BO': [-63.59, -16.29],
  'BA': [17.68, 43.92], 'BW': [24.68, -22.33], 'BR': [-51.93, -14.24], 'BN': [114.73, 4.54],
  'BG': [25.49, 42.73], 'BF': [-1.56, 12.24], 'BI': [29.92, -3.37], 'KH': [104.99, 12.57],
  'CM': [12.35, 7.37], 'CA': [-106.35, 56.13], 'CV': [-24.01, 16.00], 'CF': [20.94, 6.61],
  'TD': [18.73, 15.45], 'CL': [-71.54, -35.68], 'CN': [104.20, 35.86], 'CO': [-74.30, 4.57],
  'KM': [43.87, -11.88], 'CD': [21.76, -4.04], 'CG': [15.83, -0.23], 'CR': [-83.75, 9.75],
  'HR': [15.20, 45.10], 'CU': [-77.78, 21.52], 'CY': [33.43, 35.13], 'CZ': [15.47, 49.82],
  'DK': [9.50, 56.26], 'DJ': [42.59, 11.83], 'DM': [-61.36, 15.41], 'DO': [-70.16, 18.74],
  'EC': [-78.18, -1.83], 'EG': [30.80, 26.82], 'SV': [-88.90, 13.79], 'GQ': [10.27, 1.65],
  'ER': [39.78, 15.18], 'EE': [25.01, 58.60], 'ET': [40.49, 9.15], 'FJ': [179.41, -16.58],
  'FI': [25.75, 61.92], 'FR': [2.21, 46.23], 'GA': [11.61, -0.80], 'GM': [-15.31, 13.44],
  'GE': [43.36, 42.32], 'DE': [10.45, 51.17], 'GH': [-1.02, 7.95], 'GR': [21.82, 39.07],
  'GD': [-61.68, 12.26], 'GT': [-90.23, 15.78], 'GN': [-9.70, 9.95], 'GW': [-15.18, 11.80],
  'GY': [-58.93, 4.86], 'HT': [-72.29, 18.97], 'HN': [-86.24, 15.20], 'HU': [19.50, 47.16],
  'IS': [-19.02, 64.96], 'IN': [78.96, 20.59], 'ID': [113.92, -0.79], 'IR': [53.69, 32.43],
  'IQ': [43.68, 33.22], 'IE': [-8.24, 53.41], 'IL': [34.85, 31.05], 'IT': [12.57, 41.87],
  'CI': [-5.55, 7.54], 'JM': [-77.30, 18.11], 'JP': [138.25, 36.20], 'JO': [36.24, 30.59],
  'KZ': [66.92, 48.02], 'KE': [37.91, -0.02], 'KI': [-168.73, -3.37], 'KW': [47.48, 29.31],
  'KG': [74.77, 41.20], 'LA': [102.50, 19.86], 'LV': [24.60, 56.88], 'LB': [35.86, 33.87],
  'LS': [28.23, -29.61], 'LR': [-9.43, 6.43], 'LY': [17.23, 26.34], 'LI': [9.56, 47.17],
  'LT': [23.88, 55.17], 'LU': [6.13, 49.82], 'MK': [21.75, 41.51], 'MG': [46.87, -18.77],
  'MW': [34.30, -13.25], 'MY': [101.98, 4.21], 'MV': [73.22, 3.20], 'ML': [-4.00, 17.57],
  'MT': [14.38, 35.94], 'MH': [171.18, 7.13], 'MR': [-10.94, 21.01], 'MU': [57.55, -20.35],
  'MX': [-102.55, 23.63], 'FM': [150.55, 7.43], 'MD': [28.37, 47.41], 'MC': [7.42, 43.75],
  'MN': [103.85, 46.86], 'ME': [19.37, 42.71], 'MA': [-7.09, 31.79], 'MZ': [35.53, -18.67],
  'MM': [95.96, 21.91], 'NA': [18.49, -22.96], 'NR': [166.93, -0.52], 'NP': [84.12, 28.39],
  'NL': [5.29, 52.13], 'NZ': [174.89, -40.90], 'NI': [-85.21, 12.87], 'NE': [8.08, 17.61],
  'NG': [8.68, 9.08], 'KP': [127.51, 40.34], 'NO': [8.47, 60.47], 'OM': [55.92, 21.47],
  'PK': [69.35, 30.38], 'PW': [134.58, 7.51], 'PA': [-80.78, 8.54], 'PG': [143.96, -6.31],
  'PY': [-58.44, -23.44], 'PE': [-75.02, -9.19], 'PH': [121.77, 12.88], 'PL': [19.15, 51.92],
  'PT': [-8.22, 39.40], 'QA': [51.18, 25.35], 'RO': [24.97, 45.94], 'RU': [105.32, 61.52],
  'RW': [29.87, -1.94], 'KN': [-62.78, 17.36], 'LC': [-60.98, 13.91], 'VC': [-61.20, 12.98],
  'WS': [-172.10, -13.76], 'SM': [12.46, 43.94], 'ST': [6.61, 0.19], 'SA': [45.08, 23.89],
  'SN': [-14.45, 14.50], 'RS': [21.01, 44.02], 'SC': [55.49, -4.68], 'SL': [-11.78, 8.46],
  'SG': [103.82, 1.35], 'SK': [19.70, 48.67], 'SI': [14.99, 46.15], 'SB': [160.16, -9.65],
  'SO': [46.20, 5.15], 'ZA': [22.94, -30.56], 'KR': [127.77, 35.91], 'SS': [31.31, 6.88],
  'ES': [-3.75, 40.46], 'LK': [80.77, 7.87], 'SD': [30.22, 12.86], 'SR': [-56.03, 3.92],
  'SZ': [31.47, -26.52], 'SE': [18.64, 60.13], 'CH': [8.23, 46.82], 'SY': [38.99, 34.80],
  'TW': [120.96, 23.70], 'TJ': [71.28, 38.86], 'TZ': [34.89, -6.37], 'TH': [100.99, 15.87],
  'TL': [125.73, -8.87], 'TG': [0.82, 8.62], 'TO': [-175.20, -21.18], 'TT': [-61.22, 10.69],
  'TN': [9.54, 33.89], 'TR': [35.24, 38.96], 'TM': [59.56, 38.97], 'TV': [177.65, -7.11],
  'UG': [32.29, 1.37], 'UA': [31.17, 48.38], 'AE': [53.85, 23.42], 'GB': [-3.44, 55.38],
  'US': [-95.71, 37.09], 'UY': [-55.77, -32.52], 'UZ': [64.59, 41.38], 'VU': [166.96, -15.38],
  'VA': [12.45, 41.90], 'VE': [-66.59, 6.42], 'VN': [108.28, 14.06], 'YE': [48.52, 15.55],
  'ZM': [27.85, -13.13], 'ZW': [29.15, -19.02]
};

interface WorldVisaMapProps {
  countries: Country[];
  onCountryClick?: (country: Country) => void;
}

const WorldVisaMap: React.FC<WorldVisaMapProps> = ({ countries, onCountryClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Country[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = countries.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);
      setSearchResults(filtered);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, countries]);

  // Zoom to country
  const zoomToCountry = useCallback((country: Country) => {
    if (!map.current) return;
    
    const coords = COUNTRY_COORDINATES[country.code];
    if (coords) {
      map.current.flyTo({
        center: coords,
        zoom: 5,
        duration: 1500,
        essential: true
      });
    }
    setSelectedCountry(country);
    setSearchQuery('');
    setShowResults(false);
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = DEFAULT_MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [20, 20],
      zoom: 1.5,
      projection: 'mercator' as any,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    popup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      });

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
          const countryName = e.features[0].properties?.name_en;

          map.current.setFeatureState(
            { source: 'countries', sourceLayer: 'country_boundaries', id: hoveredStateId },
            { hover: true }
          );

          setHoveredCountry(countryName);

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
  }, [countries, onCountryClick]);

  return (
    <div className="relative w-full h-[600px] sm:h-[700px] lg:h-[800px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      
      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            className="pl-10 bg-background/95 backdrop-blur-sm shadow-lg border-0"
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border overflow-hidden z-20">
              {searchResults.map((country) => (
                <button
                  key={country.id}
                  onClick={() => zoomToCountry(country)}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 transition-colors"
                >
                  <span className="text-xl">{country.flag_emoji}</span>
                  <span className="font-medium">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-3 sm:p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm sm:text-base">Interactive Visa Map</h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Search or click countries to view visa requirements.
        </p>
        {hoveredCountry && (
          <div className="mt-2 pt-2 border-t">
            <Badge variant="outline" className="text-xs">{hoveredCountry}</Badge>
          </div>
        )}
      </div>

      {/* Selected country card */}
      {selectedCountry && (
        <Card className="absolute bottom-4 right-4 w-80 bg-background/95 backdrop-blur-sm">
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
