import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UpdateStatus {
  countryName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
}

export default function CountryContentUpdater() {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statuses, setStatuses] = useState<UpdateStatus[]>([]);

  const handleBulkUpdate = async () => {
    setUpdating(true);
    setProgress(0);
    setStatuses([]);

    try {
      // Fetch all countries
      const { data: countries, error: countriesError } = await supabase
        .from('countries')
        .select('id, name, code, slug')
        .order('name');

      if (countriesError) throw countriesError;

      if (!countries || countries.length === 0) {
        toast({
          title: "No Countries Found",
          description: "There are no countries in the database to update.",
          variant: "destructive",
        });
        setUpdating(false);
        return;
      }

      // Initialize statuses
      const initialStatuses = countries.map(c => ({
        countryName: c.name,
        status: 'pending' as const
      }));
      setStatuses(initialStatuses);

      // Update each country
      for (let i = 0; i < countries.length; i++) {
        const country = countries[i];
        
        // Update status to processing
        setStatuses(prev => prev.map(s => 
          s.countryName === country.name 
            ? { ...s, status: 'processing' as const }
            : s
        ));

        try {
          // Generate content for this country
          const { data, error } = await supabase.functions.invoke('ai-generate-content', {
            body: {
              prompt: `Create a comprehensive, SEO-optimized article section about visa-free countries for ${country.name} passport holders. Include:
              
1. A brief introduction about ${country.name} passport strength
2. Complete list of visa-free countries
3. List of visa-on-arrival countries
4. eVisa available countries
5. Important travel tips and requirements
6. Recent updates or changes (2025)

Format the content in HTML with proper headings (h2, h3), bullet points, and paragraphs. Make it informative and travel-guide style.`,
              contentType: 'Country Visa Guide',
              country: country.name,
              action: 'generate',
              provider: 'deepseek'
            }
          });

          if (error) throw error;

          // Check if content page already exists for this country
          const { data: existingPage } = await supabase
            .from('content_pages')
            .select('id')
            .eq('slug', `${country.slug}-visa-free-countries`)
            .maybeSingle();

          const pageData = {
            title: `${country.name} Passport Visa Free Countries 2025`,
            slug: `${country.slug}-visa-free-countries`,
            content: data.content,
            meta_description: `Complete guide to visa-free countries for ${country.name} passport holders in 2025. Find out where you can travel without a visa.`,
            meta_title: `${country.name} Visa Free Countries 2025 | Complete Guide`,
            keywords: [`${country.name} visa free`, `${country.name} passport`, 'visa free countries', 'travel guide', '2025'],
            is_published: true,
            ai_generated: true,
            status: 'published',
          };

          if (existingPage) {
            // Update existing
            await supabase
              .from('content_pages')
              .update(pageData)
              .eq('id', existingPage.id);
          } else {
            // Create new
            const { data: userData } = await supabase.auth.getUser();
            await supabase
              .from('content_pages')
              .insert({
                ...pageData,
                author_id: userData.user?.id,
              });
          }

          // Update status to success
          setStatuses(prev => prev.map(s => 
            s.countryName === country.name 
              ? { ...s, status: 'success' as const, message: 'Content generated and saved' }
              : s
          ));

          // Wait a bit to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error: any) {
          console.error(`Error updating ${country.name}:`, error);
          
          setStatuses(prev => prev.map(s => 
            s.countryName === country.name 
              ? { ...s, status: 'error' as const, message: error.message }
              : s
          ));
        }

        // Update progress
        setProgress(((i + 1) / countries.length) * 100);
      }

      toast({
        title: "Bulk Update Complete!",
        description: `Processed ${countries.length} countries.`,
      });

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Country Content Updater</h1>
        <p className="text-muted-foreground">
          Bulk generate and update visa-free country guides for all countries using AI
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Bulk Update All Countries
          </CardTitle>
          <CardDescription>
            This will generate comprehensive visa-free country guides for all countries in the database.
            Each country will get its own dedicated guide page with SEO-optimized content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">What this does:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Generates visa-free countries content for each country</li>
              <li>Creates or updates content pages with SEO metadata</li>
              <li>Uses DeepSeek AI for cost-effective generation</li>
              <li>Processes with delays to avoid rate limits</li>
            </ul>
          </div>

          <Button 
            onClick={handleBulkUpdate} 
            disabled={updating}
            size="lg"
            className="w-full"
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Globe className="mr-2 h-5 w-5" />
                Start Bulk Update
              </>
            )}
          </Button>

          {updating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {statuses.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Update Status:</h3>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-2">
                  {statuses.map((status, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        {status.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {status.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        {status.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {status.status === 'pending' && <div className="h-4 w-4 rounded-full border-2" />}
                        <span className="font-medium">{status.countryName}</span>
                      </div>
                      <Badge 
                        variant={
                          status.status === 'success' ? 'default' :
                          status.status === 'error' ? 'destructive' :
                          status.status === 'processing' ? 'secondary' :
                          'outline'
                        }
                      >
                        {status.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
