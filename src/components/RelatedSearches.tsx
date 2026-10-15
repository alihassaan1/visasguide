import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  countryId: string;
  countrySlug: string;
  countryName: string;
}

/**
 * "Related searches" block — Google-style internal linking strip.
 * Mixes long-tail anchor text variations to feed SEO without looking spammy.
 */
const RelatedSearches = ({ countryId, countrySlug, countryName }: Props) => {
  // Pull a few top source countries with active visa requirement pages
  const { data: topPairs } = useQuery({
    queryKey: ["related-searches", countryId],
    queryFn: async () => {
      const { data } = await supabase
        .from("visa_requirements")
        .select("from_country:countries!visa_requirements_from_country_id_fkey(name, slug)")
        .eq("to_country_id", countryId)
        .limit(8);
      return (data || [])
        .map((r: any) => r.from_country)
        .filter((c: any) => c?.slug);
    },
    enabled: !!countryId,
  });

  const links: { label: string; url: string }[] = [
    { label: `${countryName} visa requirements ${new Date().getFullYear()}`, url: `/countries/${countrySlug}` },
    { label: `${countryName} tourist visa`, url: `/visa-types/tourist` },
    { label: `${countryName} business visa`, url: `/visa-types/business` },
    { label: `${countryName} student visa`, url: `/visa-types/student` },
    { label: `${countryName} passport rank`, url: `/passport-index` },
    { label: `Travel to ${countryName}`, url: `/countries/${countrySlug}` },
    ...((topPairs || []).slice(0, 6).map((p: any) => ({
      label: `${countryName} visa for ${p.name} citizens`,
      url: `/visa-requirements/${p.slug}-to-${countrySlug}-visa-requirements`,
    }))),
  ];

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          Related searches
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {links.map((l, i) => (
            <Link
              key={i}
              to={l.url}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-foreground/80 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedSearches;
