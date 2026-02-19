import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Loader2, Sparkles, FileText, PenLine, Save, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

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
  const [searchParams] = useSearchParams();
  
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
  const [provider, setProvider] = useState<'openai' | 'deepseek'>('deepseek');
  const [generateImage, setGenerateImage] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      loadExistingContent(editId);
    }
  }, [searchParams]);

  const loadExistingContent = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setContent(data.content || '');
        setMetaDescription(data.meta_description || '');
        setKeywords(data.keywords || []);
        setFeaturedImageUrl(data.featured_image_url || '');
        setSlug(data.slug || '');
        setDraftId(data.id);
        setIsEditMode(true);
      }
    } catch (error: any) {
      toast({
        title: "Error Loading Content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
      // Parse the prompt for slug if present
      const slugMatch = prompt.match(/slug[:\s]+([\/\w-]+)/i);
      const extractedSlug = slugMatch ? slugMatch[1].replace(/^\/|\/$/g, '') : '';
      
      const { data, error } = await supabase.functions.invoke('ai-generate-content', {
        body: {
          prompt: activeTemplate || prompt,
          contentType,
          visaType,
          country,
          action: 'generate',
          provider
        }
      });

      if (error) throw error;

      setContent(data.content);
      setMetaDescription(data.metadata?.meta_description || '');
      setKeywords(data.metadata?.keywords || []);
      if (data.metadata?.title) setTitle(data.metadata.title);
      
      // Set slug from extracted value or generate from title
      if (extractedSlug) {
        setSlug(extractedSlug);
      } else if (data.metadata?.title && !isEditMode) {
        setSlug(data.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      }

      // Track AI generation
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('ai_generations').insert({
          author_id: userData.user.id,
          prompt: activeTemplate || prompt,
          content: data.content,
          tokens_used: data.tokensUsed,
          model: data.model,
          content_type: contentType,
          status: 'generated'
        });
      }

      toast({
        title: "Content Generated!",
        description: `Used ${data.tokensUsed} tokens with ${data.model}`,
      });

      // Auto-save as draft so it appears in Content Manager
      try {
        const { data: userData } = await supabase.auth.getUser();
        const autoTitle = data.metadata?.title || title || prompt?.slice(0, 60) || "AI Generated Article";
        const slug = autoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const insertPayload: any = {
          title: autoTitle,
          slug,
          content: data.content,
          meta_description: data.metadata?.meta_description || metaDescription,
          keywords: data.metadata?.keywords || keywords,
          is_published: false,
          author_id: userData.user?.id,
          ai_generated: false,
          status: 'draft',
          featured_image_url: featuredImageUrl || null,
        };
        const { data: inserted, error: insertError } = await supabase
          .from('content_pages')
          .insert(insertPayload)
          .select('id')
          .single();
        if (!insertError && inserted?.id) {
          setDraftId(inserted.id);
          setTitle(autoTitle);
        }
      } catch (e) {
        console.warn('Auto-save draft failed:', e);
      }

      // Generate image if requested
      if (generateImage && (data.metadata?.title || title)) {
        setIsGeneratingImage(true);
        try {
          const imageTitle = data.metadata?.title || title;
          const imagePrompt = `Create a professional, high-quality featured image for a visa guide article titled: "${imageTitle}". The image should be relevant to visa and travel themes, include passport, travel documents, or visa stamps imagery.`;
          
          console.log('Generating image with prompt:', imagePrompt);
          
          const { data: imgData, error: imgError } = await supabase.functions.invoke('ai-generate-content', {
            body: {
              prompt: imagePrompt,
              action: 'generate_image',
              provider: 'openai' // Always use OpenAI for images
            }
          });

          if (imgError) {
            console.error('Image generation error:', imgError);
            toast({
              title: "Image Generation Failed",
              description: imgError.message || "Could not generate image. Please check API settings.",
              variant: "destructive",
            });
          } else if (imgData?.imageUrl) {
            setFeaturedImageUrl(imgData.imageUrl);
            toast({
              title: "Image Generated!",
              description: "Featured image has been created",
            });
          }
        } catch (imgError: any) {
          console.error('Image generation failed:', imgError);
          toast({
            title: "Image Generation Failed",
            description: imgError.message || "An error occurred during image generation",
            variant: "destructive",
          });
        } finally {
          setIsGeneratingImage(false);
        }
      }
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
      const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (draftId) {
        const { error } = await supabase.from('content_pages').update({
          title,
          slug: pageSlug,
          content,
          meta_description: metaDescription,
          meta_title: title,
          keywords,
          is_published: status === 'published',
          ai_generated: false,
          status,
          featured_image_url: featuredImageUrl || null
        }).eq('id', draftId);

        if (error) throw error;
      } else {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase.from('content_pages').insert({
          title,
          slug: pageSlug,
          content,
          meta_description: metaDescription,
          meta_title: title,
          keywords,
          is_published: status === 'published',
          author_id: userData.user?.id,
          ai_generated: false,
          status,
          featured_image_url: featuredImageUrl || null
        });
        if (error) throw error;
      }

      // Submit to IndexNow when publishing
      if (status === 'published') {
        try {
          await supabase.functions.invoke('auto-indexnow', {
            body: { urls: [`/${pageSlug}`] }
          });
          console.log('Submitted to IndexNow:', pageSlug);
        } catch (indexError) {
          console.error('IndexNow submission failed:', indexError);
        }
      }

      toast({
        title: "Success!",
        description: status === 'published' 
          ? "Content published and submitted to search engines" 
          : `Content saved as ${status}`,
      });

      navigate('/admin/content');
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
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI Content Studio</h1>
        <p className="text-muted-foreground">Generate SEO-optimized visa guides and articles with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Prompt Templates Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Prompt Templates</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Quick-start templates for common content types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {PROMPT_TEMPLATES.map((template) => (
              <Button
                key={template.name}
                variant={activeTemplate === template.template ? "default" : "outline"}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => applyTemplate(template.template)}
              >
                <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{template.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Generation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Content Configuration</CardTitle>
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
                  <Label>AI Provider</Label>
                  <Select value={provider} onValueChange={(v) => setProvider(v as 'openai' | 'deepseek')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek">DeepSeek (Recommended)</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="generate-image"
                  checked={generateImage}
                  onCheckedChange={setGenerateImage}
                />
                <Label htmlFor="generate-image" className="cursor-pointer">
                  <ImageIcon className="inline-block mr-2 h-4 w-4" />
                  Generate Featured Image with AI
                </Label>
              </div>

              <div>
                <Label>Prompt or Topic</Label>
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setActiveTemplate('');
                  }}
                  placeholder="Enter your content topic or prompt in natural language. Example: 'Create an article about Pakistan passport visa-free countries with slug pakistan-passport-visa-free-countries-list-2025-update'"
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: You can specify the slug in your prompt like "with slug your-desired-slug"
                </p>
              </div>

              <Button onClick={handleGenerate} disabled={loading || isGeneratingImage} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Content...
                  </>
                ) : isGeneratingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Image...
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
              <CardContent className="space-y-6 pb-8">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!isEditMode && !slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    placeholder="Enter article title..."
                  />
                </div>

                <div>
                  <Label>Page Slug *</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                    placeholder="e.g., schengen-visa-guide"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: visas.guide/{slug || 'your-slug-here'}
                  </p>
                </div>

                <div>
                  <Label>Content</Label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Your generated content will appear here..."
                  />
                </div>

                {featuredImageUrl && (
                  <div>
                    <Label>Featured Image</Label>
                    <ImageUpload
                      value={featuredImageUrl}
                      onChange={setFeaturedImageUrl}
                      label="Featured Image"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Meta Description *</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!title && !content) {
                            toast({
                              title: "Error",
                              description: "Please add a title or content first",
                              variant: "destructive",
                            });
                            return;
                          }
                          setLoading(true);
                          try {
                            const { data, error } = await supabase.functions.invoke('ai-generate-content', {
                              body: {
                                prompt: `Generate a compelling SEO meta description (max 160 characters) for this article:\nTitle: ${title}\nContent: ${content.slice(0, 500)}`,
                                action: 'generate_meta',
                                provider: 'deepseek'
                              }
                            });
                            if (error) throw error;
                            const desc = data.content.trim().replace(/^["']|["']$/g, '').slice(0, 160);
                            setMetaDescription(desc);
                            toast({ title: "Meta Description Generated!" });
                          } catch (error: any) {
                            toast({
                              title: "Generation Failed",
                              description: error.message,
                              variant: "destructive",
                            });
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with AI
                      </Button>
                    </div>
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

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Meta Keywords</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!title && !content) {
                            toast({
                              title: "Error",
                              description: "Please add a title or content first",
                              variant: "destructive",
                            });
                            return;
                          }
                          setLoading(true);
                          try {
                            const { data, error } = await supabase.functions.invoke('ai-generate-content', {
                              body: {
                                prompt: `Generate 5-8 relevant SEO keywords (comma-separated) for this article:\nTitle: ${title}\nContent: ${content.slice(0, 500)}`,
                                action: 'generate_keywords',
                                provider: 'deepseek'
                              }
                            });
                            if (error) throw error;
                            const keywordsText = data.content.trim().replace(/^["']|["']$/g, '');
                            setKeywords(keywordsText.split(',').map((k: string) => k.trim()).filter((k: string) => k));
                            toast({ title: "Keywords Generated!" });
                          } catch (error: any) {
                            toast({
                              title: "Generation Failed",
                              description: error.message,
                              variant: "destructive",
                            });
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate with AI
                      </Button>
                    </div>
                    <Input
                      value={keywords.join(', ')}
                      onChange={(e) => setKeywords(e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                      placeholder="Enter keywords separated by commas"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      These keywords help with SEO and content categorization
                    </p>
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {keywords.map((keyword, i) => (
                          <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

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