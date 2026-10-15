import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, BookOpen, Compass, ExternalLink } from "lucide-react";
import { countryCodeToFlagEmoji } from "@/lib/utils";

interface RelatedVisaLinksProps {
  fromCountry: {
    id: string;
    name: string;
    slug: string;
    code: string;
    flag_emoji?: string | null;
  };
  toCountry: {
    id: string;
    name: string;
    slug: string;
    code: string;
    flag_emoji?: string | null;
  };
}

const RelatedVisaLinks = ({ fromCountry, toCountry }: RelatedVisaLinksProps) => {
  // Fetch popular destinations from the origin country
  const { data: popularFromOrigin = [] } = useQuery({
    queryKey: ['popular-destinations-from', fromCountry.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_requirements')
        .select(`
          to_country_id,
          requirement_type,
          countries!visa_requirements_to_country_id_fkey (
            id, name, slug, code, flag_emoji
          )
        `)
        .eq('from_country_id', fromCountry.id)
        .limit(5);
      
      if (error) throw error;
      return data?.filter(d => d.countries && d.to_country_id !== toCountry.id) || [];
    }
  });

  // Fetch other nationalities visiting the destination
  const { data: otherNationalities = [] } = useQuery({
    queryKey: ['nationalities-visiting', toCountry.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_requirements')
        .select(`
          from_country_id,
          requirement_type,
          countries!visa_requirements_from_country_id_fkey (
            id, name, slug, code, flag_emoji
          )
        `)
        .eq('to_country_id', toCountry.id)
        .limit(5);
      
      if (error) throw error;
      return data?.filter(d => d.countries && d.from_country_id !== fromCountry.id) || [];
    }
  });

  // Fetch related blog posts
  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['related-posts', fromCountry.slug, toCountry.slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pages')
        .select('id, title, slug, excerpt')
        .eq('is_published', true)
        .or(`slug.ilike.%${toCountry.slug}%,slug.ilike.%${fromCountry.slug}%,title.ilike.%${toCountry.name}%,title.ilike.%${fromCountry.name}%`)
        .not('slug', 'ilike', `${fromCountry.slug}-to-${toCountry.slug}%`)
        .limit(4);
      
      if (error) throw error;
      return data || [];
    }
  });

  const getRequirementBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'visa free':
      case 'visa_free':
        return <Badge className="bg-visa-success/10 text-visa-success text-xs">Visa Free</Badge>;
      case 'evisa':
      case 'e_visa':
        return <Badge className="bg-visa-info/10 text-visa-info text-xs">eVisa</Badge>;
      case 'visa on arrival':
      case 'visa_on_arrival':
        return <Badge className="bg-visa-warning/10 text-visa-warning text-xs">VOA</Badge>;
      default:
        return <Badge className="bg-visa-error/10 text-visa-error text-xs">Visa</Badge>;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Popular destinations from origin */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Popular from {fromCountry.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {popularFromOrigin.length > 0 ? (
            popularFromOrigin.map((item: any) => (
              <Link
                key={item.to_country_id}
                to={`/visa-requirements/${fromCountry.slug}-to-${item.countries.slug}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
                    {item.countries.flag_emoji || countryCodeToFlagEmoji(item.countries.code) || '🏳️'}
                  </span>
                  <span className="group-hover:text-primary transition-colors">{item.countries.name}</span>
                </div>
                {getRequirementBadge(item.requirement_type)}
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">No data available yet</p>
          )}
          <Link 
            to={`/countries/${fromCountry.slug}`}
            className="flex items-center gap-1 text-primary hover:underline text-sm pt-2"
          >
            View all from {fromCountry.name} <ExternalLink className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>

      {/* Other nationalities visiting destination */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Other visitors to {toCountry.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {otherNationalities.length > 0 ? (
            otherNationalities.map((item: any) => (
              <Link
                key={item.from_country_id}
                to={`/visa-requirements/${item.countries.slug}-to-${toCountry.slug}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
                    {item.countries.flag_emoji || countryCodeToFlagEmoji(item.countries.code) || '🏳️'}
                  </span>
                  <span className="group-hover:text-primary transition-colors">{item.countries.name}</span>
                </div>
                {getRequirementBadge(item.requirement_type)}
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">No data available yet</p>
          )}
          <Link 
            to={`/countries/${toCountry.slug}`}
            className="flex items-center gap-1 text-primary hover:underline text-sm pt-2"
          >
            View all for {toCountry.name} <ExternalLink className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>

      {/* Related blog posts */}
      {relatedPosts.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Related Guides & Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/${post.slug}`}
                  className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
                >
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link 
              to={`/countries/${fromCountry.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm"
            >
              <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
                {fromCountry.flag_emoji || countryCodeToFlagEmoji(fromCountry.code) || '🏳️'}
              </span>
              {fromCountry.name} Passport Guide
            </Link>
            <Link 
              to={`/countries/${toCountry.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm"
            >
              <span style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}>
                {toCountry.flag_emoji || countryCodeToFlagEmoji(toCountry.code) || '🏳️'}
              </span>
              {toCountry.name} Travel Guide
            </Link>
            <Link 
              to="/passport-index"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm"
            >
              🏆 Passport Rankings
            </Link>
            <Link 
              to="/visa-search"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm"
            >
              🔍 Visa Search
            </Link>
            <Link 
              to="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-sm"
            >
              📰 Travel Blog
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatedVisaLinks;
