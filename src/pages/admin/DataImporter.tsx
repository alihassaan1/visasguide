import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, Download, ExternalLink, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DataImporter() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImport = async (source: 'passport-index' | 'travel-buddy') => {
    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      toast({
        title: "Starting import...",
        description: `Fetching visa data from ${source === 'passport-index' ? 'Passport Index' : 'Travel Buddy AI'}`,
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 1000);

      const { data, error } = await supabase.functions.invoke('visa-data-import', {
        body: { source }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResult(data);
      toast({
        title: "Import Complete!",
        description: `Successfully imported ${data.imported} visa requirements. ${data.skipped} were skipped (already exist).`,
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "An error occurred during import",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Visa Data Importer</h1>
        <p className="text-muted-foreground">
          Automatically populate your database with visa requirements from trusted sources
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {/* Option 1: Passport Index */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Passport Index Dataset (GitHub)
            </CardTitle>
            <CardDescription>
              Free, open-source dataset with 199 countries. MIT licensed. Updated periodically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">Coverage</div>
                  <p className="text-muted-foreground">199 countries × 199 countries</p>
                </div>
                <div>
                  <div className="font-semibold mb-1">Cost</div>
                  <p className="text-muted-foreground">100% Free</p>
                </div>
                <div>
                  <div className="font-semibold mb-1">Updates</div>
                  <p className="text-muted-foreground">Periodic (community maintained)</p>
                </div>
                <div>
                  <div className="font-semibold mb-1">API Key</div>
                  <p className="text-muted-foreground">Not required</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleImport('passport-index')}
                  disabled={importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import from Passport Index
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <a 
                    href="https://github.com/ilyankou/passport-index-dataset" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Dataset
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Option 2: Travel Buddy AI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Travel Buddy AI API (RapidAPI)
            </CardTitle>
            <CardDescription>
              Professional API with 200+ passports × 210 destinations. Daily updates, includes eVisa links, stay duration, and more. Free tier available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTitle>API Key Required</AlertTitle>
                <AlertDescription>
                  You need a free RapidAPI account. Get your key at{' '}
                  <a 
                    href="https://rapidapi.com/TravelBuddyAI/api/visa-requirement" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    RapidAPI
                  </a>
                  {' '}and add it as TRAVELBUDDY_API_KEY in your secrets.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-1">Coverage</div>
                  <p className="text-muted-foreground">200+ passports × 210 destinations</p>
                </div>
                <div>
                  <div className="font-semibold mb-1">Cost</div>
                  <p className="text-muted-foreground">Free tier: 500 req/month</p>
                </div>
                <div>
                  <div className="font-semibold mb-1">Updates</div>
                  <p className="text-muted-foreground">Daily</p>
                </div>
                <div>
                  <div className="font-semibold mb-1">Details</div>
                  <p className="text-muted-foreground">eVisa links, stay duration, fees</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleImport('travel-buddy')}
                  disabled={importing}
                  variant="default"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import from Travel Buddy
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <a 
                    href="https://travel-buddy.ai/api/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    API Documentation
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Progress */}
      {importing && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {progress < 100 ? 'Importing visa requirements...' : 'Import complete!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">{result.imported}</div>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{result.skipped}</div>
                <p className="text-sm text-muted-foreground">Skipped (existed)</p>
              </div>
              {result.errors !== undefined && (
                <div>
                  <div className="text-3xl font-bold text-red-600">{result.errors}</div>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
