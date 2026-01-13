import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Image, Loader2, Check, X, RefreshCw, Sparkles, ImageOff } from "lucide-react";

interface Stats {
  total_pages: number;
  missing_images: number;
  with_images: number;
  percentage_complete: number;
}

interface GenerateResult {
  id: string;
  slug: string;
  success: boolean;
  source?: string;
  error?: string;
}

export default function ImageGenerator() {
  const [batchSize, setBatchSize] = useState<string>("25");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerateResult[]>([]);
  const queryClient = useQueryClient();

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["image-generator-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-visa-images", {
        body: { action: "stats" },
      });
      if (error) throw error;
      return data.stats;
    },
    refetchInterval: isGenerating ? 5000 : false,
  });

  // Generate images mutation
  const generateMutation = useMutation({
    mutationFn: async (size: number) => {
      const { data, error } = await supabase.functions.invoke("generate-visa-images", {
        body: { action: "generate", batch_size: size, use_ai: true },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResults(data.results || []);
      queryClient.invalidateQueries({ queryKey: ["image-generator-stats"] });
      
      if (data.failed === 0) {
        toast.success(`Successfully added images to ${data.successful} pages!`);
      } else {
        toast.warning(`Added images to ${data.successful} pages, ${data.failed} failed`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Generation failed: ${error.message}`);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    setResults([]);
    generateMutation.mutate(parseInt(batchSize));
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case "unsplash":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600">Unsplash</Badge>;
      case "ai":
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-600">AI Generated</Badge>;
      case "cached":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Cached</Badge>;
      case "default":
        return <Badge variant="outline">Default</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Image className="h-8 w-8" />
          Featured Image Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Add beautiful destination images to visa guide pages using Unsplash and AI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.total_pages.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? "..." : stats?.with_images.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Images</CardTitle>
            <ImageOff className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statsLoading ? "..." : stats?.missing_images.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.percentage_complete || 0}%</div>
            <Progress value={stats?.percentage_complete || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Images</CardTitle>
          <CardDescription>
            Process pages missing featured images. Uses curated Unsplash photos for common destinations 
            and AI generation (Lovable AI) for less common ones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Batch Size:</span>
              <Select value={batchSize} onValueChange={setBatchSize}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || (stats?.missing_images === 0)}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {batchSize} Images
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["image-generator-stats"] })}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {stats?.missing_images === 0 && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-400">
              ✓ All pages have featured images!
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <strong>How it works:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Extracts destination country from page slug (e.g., "india-to-france-visa" → France)</li>
              <li>Uses curated Unsplash images for 100+ popular destinations (instant, free)</li>
              <li>Falls back to AI image generation for uncommon destinations (requires credits)</li>
              <li>Caches country images to avoid duplicate generations</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Results</CardTitle>
            <CardDescription>
              Last batch: {results.filter(r => r.success).length} successful, {results.filter(r => !r.success).length} failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Page Slug</TableHead>
                  <TableHead>Image Source</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      {result.success ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {result.slug}
                    </TableCell>
                    <TableCell>
                      {result.success ? getSourceBadge(result.source) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {result.error || (result.source === "ai" ? "AI generated" : result.source === "unsplash" ? "From Unsplash" : "")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
