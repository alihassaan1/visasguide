import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Send, Sparkles, X, Loader2, User, Clock, Calendar } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Author {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string | null;
}

export default function ManualContentEditor() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingMeta, setGeneratingMeta] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [writerId, setWriterId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Load authors and existing page if editing
  useEffect(() => {
    loadAuthors();
    if (editId) {
      loadPage(editId);
    }
  }, [editId]);

  const loadAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from("authors")
        .select("id, name, avatar_url, role")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setAuthors(data || []);
    } catch (error: any) {
      console.error("Error loading authors:", error);
    }
  };

  const loadPage = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_pages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setContent(data.content || "");
        setFeaturedImage(data.featured_image_url || "");
        setMetaDescription(data.meta_description || "");
        setMetaTitle(data.meta_title || "");
        setKeywords(data.keywords || []);
        setExcerpt(data.excerpt || "");
        setWriterId(data.writer_id || null);
        setIsFeatured(Boolean((data as any).is_featured));
        if ((data as any).scheduled_at) {
          const date = new Date((data as any).scheduled_at);
          setScheduledAt(date.toISOString().slice(0, 16));
          setIsScheduling(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading page",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editId) {
      setSlug(generateSlug(value));
    }
  };

  // Keywords management
  const addKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  // Generate meta description with AI
  const generateMetaWithAI = async () => {
    if (!content && !title) {
      toast({
        title: "Content required",
        description: "Please add some content or title first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingMeta(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-content", {
        body: {
          prompt: `Generate an SEO-optimized meta description (max 155 characters) for the following content. Only return the meta description, nothing else:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 1000)}`,
          action: "generate_meta",
        },
      });


      if (error) throw error;

      if (data?.content) {
        setMetaDescription(data.content.substring(0, 160));
        toast({ title: "Meta description generated!" });
      }
    } catch (error: any) {
      toast({
        title: "Error generating meta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingMeta(false);
    }
  };

  // Generate keywords with AI
  const generateKeywordsWithAI = async () => {
    if (!content && !title) {
      toast({
        title: "Content required",
        description: "Please add some content or title first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingMeta(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-content", {
        body: {
          prompt: `Generate 5-8 SEO keywords for the following content. Return only comma-separated keywords, nothing else:\n\nTitle: ${title}\n\nContent: ${content.substring(0, 1000)}`,
          action: "generate_keywords",
        },
      });


      if (error) throw error;

      if (data?.content) {
        const newKeywords = data.content
          .split(",")
          .map((k: string) => k.trim().toLowerCase())
          .filter((k: string) => k && !keywords.includes(k));
        setKeywords([...keywords, ...newKeywords]);
        toast({ title: "Keywords generated!" });
      }
    } catch (error: any) {
      toast({
        title: "Error generating keywords",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingMeta(false);
    }
  };

  // Save page
  const savePage = async (publish: boolean, schedule: boolean = false) => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your page",
        variant: "destructive",
      });
      return;
    }

    if (!slug.trim()) {
      toast({
        title: "Slug required",
        description: "Please enter a URL slug for your page",
        variant: "destructive",
      });
      return;
    }

    // Validate scheduled time if scheduling
    if (schedule && scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        toast({
          title: "Invalid schedule time",
          description: "Schedule time must be in the future",
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const pageData: Record<string, any> = {
        title,
        slug,
        content,
        featured_image_url: featuredImage || null,
        meta_description: metaDescription || null,
        meta_title: metaTitle || title,
        keywords: keywords.length > 0 ? keywords : null,
        excerpt: excerpt || null,
        is_published: publish && !schedule,
        
        writer_id: writerId || null,
        scheduled_at: schedule && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (editId) {
        result = await supabase
          .from("content_pages")
          .update(pageData as any)
          .eq("id", editId)
          .select()
          .single();
      } else {
        result = await supabase
          .from("content_pages")
          .insert(pageData as any)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Submit to IndexNow if publishing immediately (not scheduling)
      if (publish && !schedule && result.data?.slug) {
        try {
          await supabase.functions.invoke("auto-indexnow", {
            body: { urls: [`/${result.data.slug}`] },
          });
        } catch (indexError) {
          console.error("IndexNow submission failed:", indexError);
        }
      }

      const successMessage = schedule 
        ? `Scheduled for ${new Date(scheduledAt).toLocaleString()}`
        : publish 
          ? "Your page is now live and submitted to search engines"
          : "Your page has been saved";

      toast({
        title: schedule ? "Page scheduled!" : publish ? "Page published!" : "Page saved as draft",
        description: successMessage,
      });

      navigate("/admin/content");
    } catch (error: any) {
      toast({
        title: "Error saving page",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/content")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {editId ? "Edit Page" : "Create New Page"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Write and publish content manually
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => savePage(false)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          {isScheduling && scheduledAt ? (
            <Button onClick={() => savePage(true, true)} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Clock className="mr-2 h-4 w-4" />
              )}
              Schedule
            </Button>
          ) : (
            <Button onClick={() => savePage(true)} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Publish Now
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Title & Slug */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter your page title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">visas.guide/</span>
                <Input
                  id="slug"
                  placeholder="your-page-slug"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="excerpt"
                placeholder="Brief summary of the page content"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select value={writerId || "none"} onValueChange={(value) => setWriterId(value === "none" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an author (optional)">
                    {writerId ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {authors.find(a => a.id === writerId)?.name || "Unknown"}
                      </div>
                    ) : (
                      "Select an author (optional)"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No author</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      <div className="flex items-center gap-2">
                        {author.avatar_url ? (
                          <img
                            src={author.avatar_url}
                            alt={author.name}
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span>{author.name}</span>
                        {author.role && (
                          <span className="text-xs text-muted-foreground">({author.role})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The author will be displayed on the published page
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload value={featuredImage} onChange={setFeaturedImage} />
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Content *</CardTitle>
            <CardDescription>Use the rich text editor to format your content</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your content here..."
            />
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Optimize your page for search engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                placeholder="SEO title (defaults to page title)"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {metaTitle.length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateMetaWithAI}
                  disabled={generatingMeta}
                >
                  {generatingMeta ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                id="metaDescription"
                placeholder="Brief description for search results (max 160 characters)"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {metaDescription.length}/160 characters
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Keywords</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateKeywordsWithAI}
                  disabled={generatingMeta}
                >
                  {generatingMeta ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add keyword and press Enter"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyPress}
                />
                <Button type="button" variant="outline" onClick={addKeyword}>
                  Add
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Publishing
            </CardTitle>
            <CardDescription>Set a future date and time to automatically publish this page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableScheduling"
                  checked={isScheduling}
                  onChange={(e) => {
                    setIsScheduling(e.target.checked);
                    if (!e.target.checked) {
                      setScheduledAt("");
                    }
                  }}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="enableScheduling">Schedule for later</Label>
              </div>
            </div>
            
            {isScheduling && (
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Publish Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="max-w-xs"
                />
                {scheduledAt && (
                  <p className="text-sm text-muted-foreground">
                    Will be published on: {new Date(scheduledAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 justify-end pb-8">
          <Button variant="outline" onClick={() => navigate("/admin/content")}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => savePage(false)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          {isScheduling && scheduledAt ? (
            <Button onClick={() => savePage(true, true)} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Clock className="mr-2 h-4 w-4" />
              )}
              Schedule
            </Button>
          ) : (
            <Button onClick={() => savePage(true)} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Publish Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
