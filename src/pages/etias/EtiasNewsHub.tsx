import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import EtiasLayout from "@/components/etias/EtiasLayout";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
}

const EtiasNewsHub = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("news_articles")
        .select("id, slug, title, excerpt, featured_image_url, published_at")
        .contains("tags", ["etias"])
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(50);
      setItems((data as NewsItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <EtiasLayout breadcrumbs={[{ name: "ETIAS", url: "/etias" }, { name: "News", url: "/etias/news" }]}>
      <SEOHead
        title="ETIAS News & Updates — Latest 2026 Launch Coverage"
        description="Breaking ETIAS news: launch delays, fee changes, country rules, and official EU announcements. Updated weekly as the Q4 2026 rollout approaches."
        canonical="https://visas.guide/etias/news"
        keywords={["ETIAS news", "ETIAS updates", "ETIAS 2026", "ETIAS latest"]}
      />

      <header>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
          ETIAS news & updates
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Every official ETIAS announcement and the analysis that matters — fee changes,
          rollout milestones, country-specific rules, and scam alerts.
        </p>
      </header>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">News coming soon</h2>
          <p className="text-muted-foreground">
            We're tracking every official ETIAS update from the EU.{" "}
            <Link to="/etias" className="text-primary hover:underline">Read the full ETIAS guide</Link>{" "}
            in the meantime.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {items.map((n) => (
            <Link key={n.id} to={`/blog/${n.slug}`}>
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow hover:border-primary/40">
                {n.featured_image_url && (
                  <img
                    src={n.featured_image_url}
                    alt={n.title}
                    loading="lazy"
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-5">
                  <time className="text-xs text-muted-foreground uppercase tracking-wide">
                    {format(new Date(n.published_at), "MMM d, yyyy")}
                  </time>
                  <h2 className="font-semibold text-foreground mt-1 line-clamp-2">{n.title}</h2>
                  {n.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{n.excerpt}</p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </EtiasLayout>
  );
};

export default EtiasNewsHub;
