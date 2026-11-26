import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  role: string | null;
  avatar_url: string | null;
  expertise: string[] | null;
  social_links: any;
  is_active: boolean | null;
  articles_count: number | null;
  created_at: string;
}

export default function AuthorManager() {
  const { toast } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    role: "",
    avatar_url: "",
    expertise: "",
    twitter: "",
    linkedin: "",
    is_active: true,
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("authors")
      .select("*")
      .order("name");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAuthors(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleOpenDialog = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        name: author.name,
        slug: author.slug,
        bio: author.bio || "",
        role: author.role || "",
        avatar_url: author.avatar_url || "",
        expertise: author.expertise?.join(", ") || "",
        twitter: author.social_links?.twitter || "",
        linkedin: author.social_links?.linkedin || "",
        is_active: author.is_active ?? true,
      });
    } else {
      setEditingAuthor(null);
      setFormData({
        name: "",
        slug: "",
        bio: "",
        role: "",
        avatar_url: "",
        expertise: "",
        twitter: "",
        linkedin: "",
        is_active: true,
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({ title: "Error", description: "Name and slug are required", variant: "destructive" });
      return;
    }

    const authorData = {
      name: formData.name,
      slug: formData.slug,
      bio: formData.bio || null,
      role: formData.role || null,
      avatar_url: formData.avatar_url || null,
      expertise: formData.expertise ? formData.expertise.split(",").map(s => s.trim()).filter(Boolean) : null,
      social_links: {
        twitter: formData.twitter || null,
        linkedin: formData.linkedin || null,
      },
      is_active: formData.is_active,
    };

    let error;
    if (editingAuthor) {
      const result = await supabase
        .from("authors")
        .update(authorData)
        .eq("id", editingAuthor.id);
      error = result.error;
    } else {
      const result = await supabase.from("authors").insert(authorData);
      error = result.error;
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Author ${editingAuthor ? "updated" : "created"} successfully` });
      setShowDialog(false);
      fetchAuthors();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return;

    const { error } = await supabase.from("authors").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Author deleted successfully" });
      fetchAuthors();
    }
  };

  return (
    <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Author Management
            </h1>
            <p className="text-muted-foreground">Manage content authors and their profiles</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Author
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAuthor ? "Edit Author" : "Add New Author"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            name: e.target.value,
                            slug: editingAuthor ? formData.slug : generateSlug(e.target.value),
                          });
                        }}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug *</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="john-doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Senior Travel Editor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Brief biography..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar URL</Label>
                    <Input
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expertise (comma-separated)</Label>
                    <Input
                      value={formData.expertise}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                      placeholder="Schengen visas, Business travel, Immigration law"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Twitter URL</Label>
                      <Input
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn URL</Label>
                      <Input
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button className="w-full" onClick={handleSave}>
                    {editingAuthor ? "Update Author" : "Create Author"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <Card key={author.id} className={!author.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {author.avatar_url ? (
                        <img
                          src={author.avatar_url}
                          alt={author.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                          {author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{author.name}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{author.role || "Author"}</p>
                      {!author.is_active && <Badge variant="secondary" className="mt-1">Inactive</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {author.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{author.bio}</p>
                  )}
                  {author.expertise && author.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {author.expertise.slice(0, 3).map((exp) => (
                        <Badge key={exp} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {author.articles_count || 0} articles
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(author)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(author.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
