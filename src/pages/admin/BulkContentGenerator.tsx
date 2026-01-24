import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Database,
  FileText,
  TrendingUp,
  Clock,
  RefreshCw
} from "lucide-react";

interface GenerationStats {
  totalCountries: number;
  totalPossibleCombinations: number;
  existingPages: number;
  missingPages: number;
  percentComplete: number;
}

const BulkContentGenerator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [batchSize, setBatchSize] = useState([500]);
  const [tier1Only, setTier1Only] = useState(false);
  const [generationLog, setGenerationLog] = useState<string[]>([]);
  const [totalGenerated, setTotalGenerated] = useState(0);

  // Fetch current stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['bulk-generation-stats'],
    queryFn: async (): Promise<GenerationStats> => {
      // Get country count
      const { count: countryCount } = await supabase
        .from('countries')
        .select('*', { count: 'exact', head: true });

      // Get existing visa requirement pages count
      const { count: existingCount } = await supabase
        .from('content_pages')
        .select('*', { count: 'exact', head: true })
        .like('slug', 'visa-requirements/%');

      const totalCountries = countryCount || 0;
      const totalPossible = totalCountries * (totalCountries - 1);
      const existing = existingCount || 0;
      const missing = Math.max(0, totalPossible - existing);
      const percent = totalPossible > 0 ? (existing / totalPossible) * 100 : 0;

      return {
        totalCountries,
        totalPossibleCombinations: totalPossible,
        existingPages: existing,
        missingPages: missing,
        percentComplete: percent
      };
    },
    staleTime: 30000
  });

  // Dry run mutation to check what would be generated
  const dryRunMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('bulk-visa-content', {
        body: { dryRun: true, tier1Only }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGenerationLog(prev => [
        `[Dry Run] Found ${data.missingCount} pages to generate`,
        `[Dry Run] ${data.existingCount} pages already exist`,
        ...prev.slice(0, 50)
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "Dry Run Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('bulk-visa-content', {
        body: { 
          batchSize: batchSize[0],
          tier1Only,
          dryRun: false
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setTotalGenerated(prev => prev + data.generated);
      setGenerationLog(prev => [
        `✓ Generated ${data.generated} pages (${data.remaining} remaining)`,
        ...prev.slice(0, 100)
      ]);
      
      if (data.remaining > 0 && isRunning) {
        // Continue with next batch after a short delay
        setTimeout(() => {
          generateMutation.mutate();
        }, 1000);
      } else if (data.remaining === 0) {
        setIsRunning(false);
        toast({
          title: "Generation Complete! 🎉",
          description: `Successfully generated all visa requirement pages.`
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['bulk-generation-stats'] });
    },
    onError: (error: Error) => {
      setIsRunning(false);
      setGenerationLog(prev => [
        `✗ Error: ${error.message}`,
        ...prev.slice(0, 100)
      ]);
      toast({
        title: "Generation Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const startGeneration = () => {
    setIsRunning(true);
    setTotalGenerated(0);
    setGenerationLog([`Starting bulk generation with batch size ${batchSize[0]}...`]);
    generateMutation.mutate();
  };

  const stopGeneration = () => {
    setIsRunning(false);
    setGenerationLog(prev => [`⏸ Generation paused by user`, ...prev]);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const estimatedTime = stats ? Math.ceil(stats.missingPages / batchSize[0]) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bulk Content Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate all missing visa requirement pages using templates (no API costs)
          </p>
        </div>
        <Badge variant={isRunning ? "default" : "secondary"} className="text-lg px-4 py-2">
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Ready"
          )}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Countries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(stats?.totalCountries || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Combinations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(stats?.totalPossibleCombinations || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Generated</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(stats?.existingPages || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Pages</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatNumber(stats?.missingPages || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Generation Progress
          </CardTitle>
          <CardDescription>
            {stats?.percentComplete.toFixed(2)}% complete ({formatNumber(stats?.existingPages || 0)} of {formatNumber(stats?.totalPossibleCombinations || 0)} pages)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={stats?.percentComplete || 0} className="h-4" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Estimated batches remaining: {estimatedTime}</span>
            <span>~{Math.ceil(estimatedTime * 2)} seconds at current batch size</span>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generation Controls
          </CardTitle>
          <CardDescription>
            Configure batch size and filters before starting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Batch Size Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Batch Size: {batchSize[0]} pages per request</Label>
              <span className="text-sm text-muted-foreground">
                Larger = faster, but may timeout
              </span>
            </div>
            <Slider
              value={batchSize}
              onValueChange={setBatchSize}
              min={100}
              max={1000}
              step={100}
              disabled={isRunning}
            />
          </div>

          {/* Tier 1 Only Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tier 1 Countries First</Label>
              <p className="text-sm text-muted-foreground">
                Prioritize high-traffic countries (USA, UK, India, Germany, etc.)
              </p>
            </div>
            <Switch
              checked={tier1Only}
              onCheckedChange={setTier1Only}
              disabled={isRunning}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => dryRunMutation.mutate()}
              variant="outline"
              disabled={isRunning || dryRunMutation.isPending}
            >
              {dryRunMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Preview (Dry Run)
            </Button>

            {!isRunning ? (
              <Button onClick={startGeneration} disabled={generateMutation.isPending}>
                <Play className="w-4 h-4 mr-2" />
                Start Generation
              </Button>
            ) : (
              <Button onClick={stopGeneration} variant="destructive">
                <Pause className="w-4 h-4 mr-2" />
                Stop Generation
              </Button>
            )}

            <Button
              onClick={() => refetchStats()}
              variant="ghost"
              disabled={isRunning}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Stats
            </Button>
          </div>

          {/* Session Stats */}
          {totalGenerated > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-green-700 dark:text-green-300 font-medium">
                ✓ Generated {formatNumber(totalGenerated)} pages this session
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Generation Log
          </CardTitle>
          <CardDescription>
            Real-time progress updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {generationLog.length === 0 ? (
              <p className="text-muted-foreground">No generation activity yet. Click "Start Generation" to begin.</p>
            ) : (
              generationLog.map((log, i) => (
                <div key={i} className={`py-1 ${log.startsWith('✓') ? 'text-green-600' : log.startsWith('✗') ? 'text-red-600' : ''}`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Zap className="h-8 w-8 text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300">Template-Based Generation</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                This generator uses pre-written templates with 10+ variations per section, creating unique content for each country combination without any AI API costs. Each page includes randomized:
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 list-disc list-inside">
                <li>Opening paragraphs tailored to visa type</li>
                <li>Requirements and documents sections</li>
                <li>Application process explanations</li>
                <li>Cost breakdowns and travel tips</li>
                <li>FAQ sections (3-4 randomly selected)</li>
                <li>Author voice and connector phrases</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkContentGenerator;
