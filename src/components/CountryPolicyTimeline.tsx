import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, Info, AlertCircle } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  visa_free_added: "Visa-Free Added",
  visa_free_removed: "Visa-Free Removed",
  evisa_launched: "eVisa Launched",
  fee_change: "Fee Change",
  processing_time_change: "Processing Time",
  entry_ban: "Entry Ban",
  requirement_change: "Requirement Change",
  policy_announcement: "Announcement",
};

const severityIcon = (s: string) => {
  if (s === "critical") return <AlertCircle className="h-4 w-4 text-destructive" />;
  if (s === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  if (s === "update") return <Bell className="h-4 w-4 text-blue-600" />;
  return <Info className="h-4 w-4 text-muted-foreground" />;
};

interface Props {
  countryId: string;
  countrySlug: string;
  countryName: string;
  limit?: number;
}

export default function CountryPolicyTimeline({ countryId, countrySlug, countryName, limit = 10 }: Props) {
  const { data: changes } = useQuery({
    queryKey: ["country-policy-timeline", countryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visa_policy_changes")
        .select("id, title, summary, change_type, severity, announcement_date, effective_date, news_articles(slug)")
        .eq("country_id", countryId)
        .eq("is_published", true)
        .order("announcement_date", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
  });

  if (!changes || changes.length === 0) return null;

  // ItemList schema for SEO
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${countryName} Visa Policy Changes`,
    itemListElement: changes.map((c: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Event",
        name: c.title,
        description: c.summary,
        startDate: c.effective_date || c.announcement_date,
      },
    })),
  };

  return (
    <section className="my-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Recent Visa Policy Changes — {countryName}</h2>
        <Link to={`/policy-updates?country=${countrySlug}`} className="text-sm text-primary hover:underline">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {changes.map((c: any) => (
          <Card key={c.id} className="hover:shadow-xs transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">{severityIcon(c.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[c.change_type]}</Badge>
                    <span className="text-xs text-muted-foreground">{c.announcement_date}</span>
                    {c.effective_date && (
                      <span className="text-xs text-muted-foreground">• Effective: {c.effective_date}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base mb-1">
                    {c.news_articles?.slug ? (
                      <Link to={`/blog/${c.news_articles.slug}`} className="hover:underline">{c.title}</Link>
                    ) : c.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
