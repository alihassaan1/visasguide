import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, CheckCircle, AlertCircle, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UpdateStatus {
  combination: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
}

export default function VisaRequirementsContentUpdater() {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statuses, setStatuses] = useState<UpdateStatus[]>([]);
  const [mode, setMode] = useState<'top-countries' | 'missing-data'>('top-countries');
  const [limit, setLimit] = useState(50);

  const handleBulkUpdate = async () => {
    setUpdating(true);
    setProgress(0);
    setStatuses([]);

    try {
      let combinations: Array<{ from: any; to: any }> = [];

      if (mode === 'top-countries') {
        // Get top countries by passport rank or search stats
        const { data: topCountries, error: topError } = await supabase
          .from('countries')
          .select('id, name, code, slug')
          .order('passport_rank', { ascending: true, nullsFirst: false })
          .limit(limit);

        if (topError) throw topError;

        // Generate combinations between top countries
        for (const from of topCountries || []) {
          for (const to of topCountries || []) {
            if (from.id !== to.id) {
              combinations.push({ from, to });
            }
          }
        }
      } else {
        // Find combinations without content_pages entries
        const { data: allCountries, error: countriesError } = await supabase
          .from('countries')
          .select('id, name, code, slug')
          .order('name');

        if (countriesError) throw countriesError;

        // Check which combinations are missing
        for (let i = 0; i < Math.min(allCountries?.length || 0, limit); i++) {
          const from = allCountries[i];
          for (let j = 0; j < Math.min(allCountries?.length || 0, limit); j++) {
            const to = allCountries[j];
            if (from.id !== to.id) {
              const slug = `${from.slug}-to-${to.slug}-visa-requirements`;
              const { data: existing } = await supabase
                .from('content_pages')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

              if (!existing) {
                combinations.push({ from, to });
                if (combinations.length >= limit) break;
              }
            }
          }
          if (combinations.length >= limit) break;
        }
      }

      if (combinations.length === 0) {
        toast({
          title: "No Combinations Found",
          description: "All selected combinations already have content.",
        });
        setUpdating(false);
        return;
      }

      // Limit to prevent excessive API calls
      const maxToProcess = Math.min(combinations.length, limit);
      combinations = combinations.slice(0, maxToProcess);

      // Initialize statuses
      const initialStatuses = combinations.map(c => ({
        combination: `${c.from.name} → ${c.to.name}`,
        status: 'pending' as const
      }));
      setStatuses(initialStatuses);

      // Update each combination
      for (let i = 0; i < combinations.length; i++) {
        const { from, to } = combinations[i];
        
        // Update status to processing
        setStatuses(prev => prev.map(s => 
          s.combination === `${from.name} → ${to.name}`
            ? { ...s, status: 'processing' as const }
            : s
        ));

        try {
          // Check if visa requirement data exists
          const { data: visaData } = await supabase
            .from('visa_requirements')
            .select('requirement_type, max_stay_days, processing_time_days, fee_usd, notes')
            .eq('from_country_id', from.id)
            .eq('to_country_id', to.id)
            .maybeSingle();

          // Generate content
          const prompt = visaData 
            ? `Create a comprehensive, SEO-optimized guide about ${to.name} visa requirements for ${from.name} citizens. Include:

1. Visa requirement type: ${visaData.requirement_type}
${visaData.max_stay_days ? `2. Maximum stay: ${visaData.max_stay_days} days` : ''}
${visaData.processing_time_days ? `3. Processing time: ${visaData.processing_time_days} days` : ''}
${visaData.fee_usd ? `4. Visa fee: $${visaData.fee_usd} USD` : ''}
5. Required documents and application process
6. Entry requirements and tips
7. Important travel advisories
${visaData.notes ? `8. Additional notes: ${visaData.notes}` : ''}

Format the content in HTML with proper headings (h2, h3), bullet points, and sections. Make it informative and travel-guide style.`
            : `Create a comprehensive, SEO-optimized guide about ${to.name} visa requirements for ${from.name} passport holders. Include:

1. Visa policy overview (visa-free, visa on arrival, eVisa, or visa required)
2. Application process and requirements
3. Required documents
4. Processing times and fees
5. Entry requirements and travel tips
6. Important advisories and updates for 2026

Format the content in HTML with proper headings (h2, h3), bullet points, and paragraphs. Make it informative and travel-guide style.`;

          const { data, error } = await supabase.functions.invoke('ai-generate-content', {
            body: {
              prompt,
              contentType: 'Visa Requirements Guide',
              action: 'generate',
              provider: 'deepseek'
            }
          });

          if (error) throw error;

          // Create or update content page
          const slug = `${from.slug}-to-${to.slug}-visa-requirements`;
          const { data: existingPage } = await supabase
            .from('content_pages')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();

          const pageData = {
            title: `${to.name} Visa Requirements for ${from.name} Citizens`,
            slug,
            content: data.content,
            meta_description: `Complete visa guide for ${from.name} passport holders traveling to ${to.name}. Requirements, fees, processing times, and application process.`,
            meta_title: `${to.name} Visa for ${from.name} Citizens 2026 | Requirements & Guide`,
            keywords: [`${to.name} visa`, `${from.name} to ${to.name}`, 'visa requirements', 'travel guide', '2026'],
            is_published: true,
            ai_generated: false,
            status: 'published',
          };

          if (existingPage) {
            await supabase
              .from('content_pages')
              .update(pageData)
              .eq('id', existingPage.id);
          } else {
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
            s.combination === `${from.name} → ${to.name}`
              ? { ...s, status: 'success' as const, message: 'Content generated' }
              : s
          ));

          // Wait to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error: any) {
          console.error(`Error updating ${from.name} → ${to.name}:`, error);
          
          setStatuses(prev => prev.map(s => 
            s.combination === `${from.name} → ${to.name}`
              ? { ...s, status: 'error' as const, message: error.message }
              : s
          ));
        }

        setProgress(((i + 1) / combinations.length) * 100);
      }

      toast({
        title: "Bulk Update Complete!",
        description: `Processed ${combinations.length} visa requirement combinations.`,
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
        <h1 className="text-3xl font-bold mb-2">Visa Requirements Content Updater</h1>
        <p className="text-muted-foreground">
          Generate comprehensive visa requirement guides for country combinations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Bulk Generate Visa Requirement Guides
          </CardTitle>
          <CardDescription>
            Generate AI-powered visa requirement content for specific country combinations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Generation Mode</Label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-countries">Top Countries (by passport rank)</SelectItem>
                  <SelectItem value="missing-data">Missing Content Pages</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {mode === 'top-countries' 
                  ? 'Generate combinations between the top-ranked passport countries'
                  : 'Find and generate content for combinations without existing pages'
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label>Number of Combinations</Label>
              <Input
                type="number"
                min="1"
                max="500"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of visa requirement guides to generate (recommended: 50-100)
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">What this does:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Generates comprehensive visa requirement guides for selected combinations</li>
              <li>Uses existing visa data when available, or creates general guides</li>
              <li>Creates SEO-optimized content pages with proper metadata</li>
              <li>Uses DeepSeek AI for cost-effective generation</li>
              <li>Processes with 2-second delays to avoid rate limits</li>
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
                <Search className="mr-2 h-5 w-5" />
                Generate {limit} Visa Guides
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
              <h3 className="font-semibold">Generation Status:</h3>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-2">
                  {statuses.map((status, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        {status.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {status.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        {status.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {status.status === 'pending' && <div className="h-4 w-4 rounded-full border-2" />}
                        <span className="font-medium text-sm">{status.combination}</span>
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
