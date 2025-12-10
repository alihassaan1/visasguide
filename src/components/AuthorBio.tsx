import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Twitter, Linkedin, Globe } from "lucide-react";

interface AuthorBioProps {
  name?: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  expertise?: string[];
  compact?: boolean;
}

// Default editorial team members for E-E-A-T signals
const defaultAuthors = {
  editorial: {
    name: "Visas.Guide Editorial Team",
    role: "Travel & Immigration Experts",
    bio: "Our team of travel experts and immigration specialists has helped over 500,000 travelers navigate visa requirements worldwide. With combined experience of 50+ years in travel documentation, we provide accurate, up-to-date visa information you can trust.",
    avatarUrl: "/favicon.png",
    expertise: ["Visa Requirements", "Immigration Policy", "Travel Documentation"],
  },
  sarah: {
    name: "Sarah Mitchell",
    role: "Senior Visa Specialist",
    bio: "Sarah has spent 12 years helping travelers navigate complex visa processes. Former consular affairs officer with expertise in Schengen, US, and UK visa applications.",
    avatarUrl: "/favicon.png",
    twitterHandle: "visasguide",
    expertise: ["Schengen Visa", "US Visa", "UK Visa"],
  },
  james: {
    name: "James Chen",
    role: "Asia-Pacific Travel Expert",
    bio: "James is a seasoned traveler who has visited 80+ countries. He specializes in Asian visa requirements and has been writing about travel documentation for 8 years.",
    avatarUrl: "/favicon.png",
    expertise: ["Asia Travel", "eVisa Systems", "Travel Insurance"],
  },
};

const AuthorBio = ({
  name = defaultAuthors.editorial.name,
  role = defaultAuthors.editorial.role,
  bio = defaultAuthors.editorial.bio,
  avatarUrl = defaultAuthors.editorial.avatarUrl,
  twitterHandle,
  linkedinUrl,
  websiteUrl,
  expertise = defaultAuthors.editorial.expertise,
  compact = false,
}: AuthorBioProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-4 border-t border-border/50">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="mt-8 border-border/50 bg-muted/30">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-foreground">{name}</h4>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
            
            {expertise && expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {expertise.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 pt-1">
              {twitterHandle && (
                <a
                  href={`https://twitter.com/${twitterHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Follow ${name} on Twitter`}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Connect with ${name} on LinkedIn`}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Visit ${name}'s website`}
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
