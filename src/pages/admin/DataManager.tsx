import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Database, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DataManager = () => {
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<any>(null);

  const handleBackfillAll = async () => {
    setIsBackfilling(true);
    setBackfillResult(null);
    
    try {
      toast.info("Starting country data backfill...");
      
      const { data, error } = await supabase.functions.invoke('countries-backfill', {
        body: { all: true }
      });

      if (error) throw error;

      setBackfillResult(data);
      toast.success(`Successfully updated ${data.updated} countries!`);
    } catch (error: any) {
      console.error("Backfill error:", error);
      toast.error(`Backfill failed: ${error.message}`);
      setBackfillResult({ error: error.message });
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Data Manager</h1>
            <p className="text-muted-foreground">
              Manage and update country data across the platform
            </p>
          </div>

          {/* Backfill Countries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Country Data Backfill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will fetch and update missing country information (capital, currency, population, region, flag, etc.) 
                from the REST Countries API for all countries in the database.
              </p>
              
              <Button 
                onClick={handleBackfillAll}
                disabled={isBackfilling}
                className="w-full sm:w-auto"
              >
                {isBackfilling ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update All Country Data
                  </>
                )}
              </Button>

              {backfillResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(backfillResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visa Requirements Info */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                <AlertCircle className="h-5 w-5" />
                Visa Requirements Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                The visa requirements table (visa_requirements) needs to be populated with data showing which countries 
                can travel to other countries visa-free, on arrival, etc.
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                This data is typically sourced from:
              </p>
              <ul className="text-sm text-orange-800 dark:text-orange-200 list-disc list-inside space-y-1">
                <li>Passport Index API</li>
                <li>IATA Travel Centre</li>
                <li>Manual data entry from official government sources</li>
              </ul>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                To populate this data, you'll need to either import a CSV file or create an edge function 
                that fetches from a visa requirements API service.
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Database Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">Countries</p>
                  <p className="text-sm text-muted-foreground">In database</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">Visa Rules</p>
                  <p className="text-sm text-muted-foreground">Requirements</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">Updates</p>
                  <p className="text-sm text-muted-foreground">Last sync</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DataManager;
