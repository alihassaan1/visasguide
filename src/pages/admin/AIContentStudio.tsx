import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Loader2, Sparkles, FileText, PenLine, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PROMPT_TEMPLATES = [
  {
    name: "Full Visa Guide Template",
    template: "Create a comprehensive guide about [TOPIC] including requirements, application process, fees, processing times, required documents, eligibility criteria, tips for success, and common FAQs."
  },
  {
    name: "Step-by-Step Application Process",
    template: "Write a detailed step-by-step guide on how to apply for [TOPIC]. Include each stage of the process, required forms, where to submit, and what to expect at each step."
  },
  {
    name: "Visa News Update",
    template: "Write a news article about recent changes or updates regarding [TOPIC]. Include what changed, when it takes effect, who is affected, and what travelers need to know."
  },
  {
    name: "Country Requirements Summary",
    template: "Summarize visa requirements for [COUNTRY] including visa-free access, visa on arrival, eVisa options, and traditional visa requirements for major nationalities."
  },
];

export default function AIContentStudio() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState("Evergreen Guide");
  const [visaType, setVisaType] = useState("");
  const [country, setCountry] = useState("");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [activeTemplate, setActiveTemplate] = useState("");

  const handleGenerate = async () => {
    if (!prompt && !activeTemplate) {
      toast({
        title: "Error",
        description: "Please enter a prompt or select a template",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-content', {
        body: {
          prompt: activeTemplate || prompt,
          contentType,
          visaType,
          country,
          action: 'generate'
        }
      });

      if (error) throw error;

      setContent(data.content);
      setMetaDescription(data.metadata?.meta_description || '');
      setKeywords(data.metadata?.keywords || []);
      if (data.metadata?.title) setTitle(data.metadata.title);

      // Track AI generation
      // @ts-ignore - ai_generations table exists but types not regenerated yet
      await (supabase.from('ai_generations') as any).insert({
        author_id: (await supabase.auth.getUser()).data.user?.id,
        prompt: activeTemplate || prompt,
        content: data.content,
        tokens_used: data.tokensUsed,
        model: data.model,
        content_type: contentType,
        status: 'generated'
      });

      toast({
        title: "Content Generated!",
        description: `Used ${data.tokensUsed} tokens with ${data.model}`,
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async (action: string) => {
    if (!content) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-content', {
        body: {
          prompt: content,
          action
        }
      });

      if (error) throw error;
      setContent(data.content);

      toast({
        title: "Content Updated!",
        description: `Applied: ${action.replace('_', ' ')}`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // @ts-ignore - new columns exist but types not regenerated yet
      const { error } = await supabase.from('content_pages')
        // @ts-ignore
        .insert({
          title,
          slug,
          content,
          meta_description: metaDescription,
          keywords,
          is_published: status === 'published',
          author_id: (await supabase.auth.getUser()).data.user?.id,
          ai_generated: true,
          status
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Content saved as ${status}`,
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const applyTemplate = (template: string) => {
    setActiveTemplate(template);
    setPrompt(template);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Content Studio</h1>
        <p className="text-muted-foreground">Generate SEO-optimized visa guides and articles with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt Templates Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Prompt Templates</CardTitle>
            <CardDescription>Quick-start templates for common content types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {PROMPT_TEMPLATES.map((template) => (
              <Button
                key={template.name}
                variant={activeTemplate === template.template ? "default" : "outline"}
                className="w-full justify-start text-left"
                onClick={() => applyTemplate(template.template)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {template.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Content Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Evergreen Guide">Evergreen Guide</SelectItem>
                      <SelectItem value="News Update">News Update</SelectItem>
                      <SelectItem value="FAQ Page">FAQ Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Visa Type (Optional)</Label>
                  <Input
                    value={visaType}
                    onChange={(e) => setVisaType(e.target.value)}
                    placeholder="e.g., Tourist, Work, Student"
                  />
                </div>

                <div>
                  <Label>Country (Optional)</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Canada, United States"
                  />
                </div>
              </div>

              <div>
                <Label>Prompt or Topic</Label>
                <Input
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setActiveTemplate('');
                  }}
                  placeholder="Enter your content topic or prompt..."
                  className="h-20"
                />
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Draft
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Editor */}
          {content && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleAIAction('improve_seo')} disabled={loading}>
                    <PenLine className="mr-2 h-4 w-4" />
                    Improve SEO
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAIAction('make_concise')} disabled={loading}>
                    Make Concise
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAIAction('add_intro')} disabled={loading}>
                    Add Intro
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAIAction('add_summary')} disabled={loading}>
                    Add Summary
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title..."
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Your generated content will appear here..."
                  />
                </div>

                <Tabs defaultValue="meta">
                  <TabsList>
                    <TabsTrigger value="meta">SEO Metadata</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  </TabsList>
                  <TabsContent value="meta" className="space-y-4">
                    <div>
                      <Label>Meta Description</Label>
                      <Input
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="SEO description (max 160 characters)"
                        maxLength={160}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {metaDescription.length}/160 characters
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="keywords">
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button onClick={() => handleSave('draft')} variant="outline" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button onClick={() => handleSave('published')} className="flex-1">
                    Publish Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}