import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, AlertCircle, Info, ArrowRight } from "lucide-react";

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

export default function BreakingPolicyUpdates() {
  const { data: changes } = useQuery({
    queryKey: ["breaking-policy-updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visa_policy_changes")
        .select("id, title, summary, change_type, severity, announcement_date, countries(name, slug, flag_emoji), news_articles(slug)")
        .eq("is_published", true)
        .order("announcement_date", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data || [];
    },
  });

  if (!changes || changes.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Breaking Visa Updates</h2>
          <p className="text-muted-foreground">Latest visa policy changes from around the world</p>
        </div>
        <Link to="/policy-updates" className="text-primary hover:underline inline-flex items-center gap-1 text-sm font-medium">
          View timeline <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {changes.map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-1">{severityIcon(c.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[c.change_type]}</Badge>
                    {c.countries && (
                      <span className="text-sm font-medium">{c.countries.flag_emoji} {c.countries.name}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{c.announcement_date}</span>
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-2">
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
