import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Twitter, Linkedin, Globe } from "lucide-react";

interface AuthorBioProps {
  writerId?: string;
  compact?: boolean;
}

interface Author {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  expertise: string[];
  social_links: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

const AuthorBio = ({ writerId, compact = false }: AuthorBioProps) => {
  // Fetch author from database
  const { data: author } = useQuery({
    queryKey: ['author', writerId],
    queryFn: async () => {
      if (!writerId) {
        // Return a random author for display
        const { data } = await supabase
          .from('authors')
          .select('*')
          .eq('is_active', true)
          .limit(5);
        
        if (data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          return data[randomIndex] as Author;
        }
        return null;
      }
      
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .eq('id', writerId)
        .single();
      
      if (error) return null;
      return data as Author;
    },
  });

  // Default fallback if no author found
  const displayAuthor = author || {
    name: "Visas.Guide Editorial Team",
    slug: "editorial",
    role: "Travel & Immigration Experts",
    bio: "Our team of travel experts and immigration specialists has helped over 500,000 travelers navigate visa requirements worldwide.",
    avatar_url: "/favicon.png",
    expertise: ["Visa Requirements", "Immigration Policy", "Travel Documentation"],
    social_links: {},
  };

  const initials = displayAuthor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const expertise = displayAuthor.expertise as string[] || [];
  const socialLinks = displayAuthor.social_links as { twitter?: string; linkedin?: string; website?: string } || {};

  if (compact) {
    return (
      <Link 
        to={author?.slug ? `/author/${author.slug}` : "#"} 
        className="flex items-center gap-3 py-4 border-t border-border/50 hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={displayAuthor.avatar_url || undefined} alt={displayAuthor.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm text-foreground">{displayAuthor.name}</p>
          <p className="text-xs text-muted-foreground">{displayAuthor.role}</p>
        </div>
      </Link>
    );
  }

  return (
    <Card className="mt-8 border-border/50 bg-muted/30">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={author?.slug ? `/author/${author.slug}` : "#"} className="shrink-0">
            <Avatar className="h-16 w-16 hover:ring-2 hover:ring-primary/50 transition-all">
              <AvatarImage src={displayAuthor.avatar_url || undefined} alt={displayAuthor.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 space-y-3">
            <div>
              <Link 
                to={author?.slug ? `/author/${author.slug}` : "#"} 
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {displayAuthor.name}
              </Link>
              <p className="text-sm text-muted-foreground">{displayAuthor.role}</p>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">{displayAuthor.bio}</p>
            
            {expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {expertise.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 pt-1">
              {socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Follow ${displayAuthor.name} on Twitter`}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Connect with ${displayAuthor.name} on LinkedIn`}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Visit ${displayAuthor.name}'s website`}
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorBio;
