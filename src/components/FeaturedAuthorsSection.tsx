import { useAuthors } from "@/hooks/useSharedData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedAuthorsSection = () => {
  const { data: allAuthors, isLoading } = useAuthors();
  const authors = (allAuthors || [])
    .filter((a: any) => a.is_active)
    .sort((a: any, b: any) => (b.articles_count || 0) - (a.articles_count || 0))
    .slice(0, 5);

  if (isLoading || !authors?.length) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Our Expert Team</h2>
            <p className="text-muted-foreground mt-1">
              Meet the travel experts behind our visa guides
            </p>
          </div>
          <Link 
            to="/about" 
            className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
          >
            About Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {authors.map((author) => (
            <Link key={author.id} to={`/author/${author.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 group text-center">
                <CardContent className="p-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3 overflow-hidden">
                    {author.avatar_url ? (
                      <img 
                        src={author.avatar_url} 
                        alt={author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {author.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {author.name}
                  </h3>
                  <p className="text-xs text-primary mt-1">{author.role}</p>
                  {author.expertise && author.expertise.length > 0 && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {author.expertise[0]}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAuthorsSection;
