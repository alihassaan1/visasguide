import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Map, Key } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorldVisaMap from "@/components/WorldVisaMap";
import SEOHead from "@/components/SEOHead";
import { usePageTracking } from "@/hooks/useAnalytics";
import { Alert, AlertDescription } from "@/components/ui/alert";

const VisaSearch = () => {
  const [mapboxApiKey, setMapboxApiKey] = useState("");
  const [tempApiKey, setTempApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  
  // Track page view
  usePageTracking('visa-search');

  // Fetch countries from Supabase
  const { data: countries = [] } = useQuery({
    queryKey: ['countries-visa-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('mapbox_api_key');
    if (savedKey) {
      setMapboxApiKey(savedKey);
      setShowApiKeyInput(false);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (tempApiKey) {
      localStorage.setItem('mapbox_api_key', tempApiKey);
      setMapboxApiKey(tempApiKey);
      setShowApiKeyInput(false);
    }
  };

  const handleCountryClick = (country: any) => {
    console.log('Country clicked:', country);
  };

  return (
    <>
      <SEOHead 
        title="Interactive World Visa Map - Check Visa Requirements by Country | Visas.Guide"
        description="Explore visa requirements worldwide with our interactive world map. Click on any country to view detailed visa information, processing times, and travel requirements."
        keywords={["visa map", "world visa requirements", "interactive visa search", "country visa info", "travel map"]}
        canonical="https://visas.guide/visa-search"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
          {/* Page Header */}
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8 lg:mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Map className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                Interactive World Visa Map
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore visa requirements worldwide. Hover over countries to see details, click to view complete visa information and requirements.
            </p>
          </div>

          {/* API Key Input Section */}
          {showApiKeyInput && (
            <Card className="mb-6 sm:mb-8 max-w-2xl mx-auto border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Key className="h-5 w-5" />
                  Mapbox API Key Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    To display the interactive map, please enter your Mapbox API key. Get your free API key at{' '}
                    <a 
                      href="https://mapbox.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      mapbox.com
                    </a>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-sm sm:text-base">Mapbox Public Token</Label>
                  <Input
                    id="apiKey"
                    type="text"
                    placeholder="pk.eyJ1..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key will be saved locally in your browser
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleSaveApiKey} 
                    disabled={!tempApiKey}
                    className="flex-1"
                  >
                    Save & Load Map
                  </Button>
                  {mapboxApiKey && (
                    <Button 
                      variant="outline"
                      onClick={() => setShowApiKeyInput(false)}
                      className="flex-1 sm:flex-initial"
                    >
                      Use Saved Key
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map Section */}
          {!showApiKeyInput && mapboxApiKey && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Explore Visa Requirements</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {countries.length} countries loaded
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowApiKeyInput(true);
                    setTempApiKey("");
                  }}
                  className="text-xs sm:text-sm"
                >
                  <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Change API Key
                </Button>
              </div>

              <WorldVisaMap 
                countries={countries}
                onCountryClick={handleCountryClick}
                apiKey={mapboxApiKey}
              />

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                      {countries.length}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Countries Available</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                      Interactive
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Click to Explore</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                      Updated
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Real-time Data</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* How to Use Guide */}
          <Card className="mt-8 sm:mt-12">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">How to Use the Visa Map</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 text-sm sm:text-base font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Hover Over Countries</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Move your cursor over any country to see its name and a preview
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 text-sm sm:text-base font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Click to View Details</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Click on a country to see detailed visa requirements, fees, and processing times
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0 text-sm sm:text-base font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Navigate & Zoom</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Use the controls in the top right to zoom in/out and navigate the map
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VisaSearch;
