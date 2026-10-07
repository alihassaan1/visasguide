import { useCountries } from "@/hooks/useSharedData";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plane, FileText, Stamp, Ban } from "lucide-react";

type Country = {
  id: string;
  name: string;
  slug: string;
  flag_emoji: string | null;
  passport_rank: number | null;
  passport_score: number | null;
};

type DestRow = {
  to_country_id: string;
  requirement_type: string;
};

const groups = [
  { key: "visa_free", label: "Visa-Free", icon: Plane, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { key: "visa_on_arrival", label: "Visa on Arrival", icon: Stamp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { key: "e_visa", label: "eVisa", icon: FileText, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
  { key: "visa_required", label: "Visa Required", icon: Ban, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
] as const;

const PassportVisaFree = () => {
  const { slug } = useParams<{ slug: string }>();
  const passportSlug = (slug || "").replace(/-passport-visa-free-countries$/, "");
  const [passport, setPassport] = useState<Country | null>(null);
  const [destinations, setDestinations] = useState<(Country & { requirement_type: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const { data: allCountries } = useCountries();

  useEffect(() => {
    if (!allCountries) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const p = allCountries.find((c) => c.slug === passportSlug);
      if (!p || cancelled) {
        setPassport(null);
        setLoading(false);
        return;
      }
      setPassport(p as Country);

      const { data: reqs } = await supabase
        .from("visa_requirements")
        .select("to_country_id,requirement_type")
        .eq("from_country_id", p.id);

      const ids = (reqs ?? []).map((r: DestRow) => r.to_country_id);
      const idSet = new Set(ids);
      const byId = new Map(allCountries.filter((c) => idSet.has(c.id)).map((c: any) => [c.id, c]));
      const merged = (reqs ?? [])
        .map((r: DestRow) => {
          const c = byId.get(r.to_country_id);
          return c ? { ...(c as Country), requirement_type: r.requirement_type } : null;
        })
        .filter(Boolean) as (Country & { requirement_type: string })[];

      if (!cancelled) {
        setDestinations(merged);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [passportSlug, allCountries]);

  const grouped = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const result: Record<string, (Country & { requirement_type: string })[]> = {
      visa_free: [], visa_on_arrival: [], e_visa: [], visa_required: [],
    };
    destinations
      .filter((d) => !f || d.name.toLowerCase().includes(f))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((d) => {
        if (result[d.requirement_type]) result[d.requirement_type].push(d);
      });
    return result;
  }, [destinations, filter]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
          <Skeleton className="h-10 w-2/3 mb-3" />
          <Skeleton className="h-5 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Passport not found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find visa data for "{passportSlug}".
          </p>
          <Link to="/passport-index" className="text-primary underline">
            Browse the Passport Index
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const counts = {
    visa_free: grouped.visa_free.length,
    visa_on_arrival: grouped.visa_on_arrival.length,
    e_visa: grouped.e_visa.length,
    visa_required: grouped.visa_required.length,
  };
  const visaFreeTotal = counts.visa_free + counts.visa_on_arrival + counts.e_visa;

  const title = `${passport.name} Passport Visa-Free Countries 2026 – Full List | Visas.Guide`;
  const description = `Complete 2026 list of visa-free, visa-on-arrival, and eVisa countries for ${passport.name} passport holders. ${visaFreeTotal}+ destinations covered.`;
  const canonical = `https://visas.guide/${passport.slug}-passport-visa-free-countries`;

  const faqs = [
    {
      question: `How many countries can ${passport.name} passport holders visit visa-free in 2026?`,
      answer: `${passport.name} passport holders can enter approximately ${counts.visa_free} countries visa-free, plus ${counts.visa_on_arrival} with visa on arrival and ${counts.e_visa} with an eVisa — for a total of ${visaFreeTotal} easy-access destinations.`,
    },
    {
      question: `What is the ${passport.name} passport ranking?`,
      answer: passport.passport_rank
        ? `The ${passport.name} passport is ranked #${passport.passport_rank} globally based on visa-free access.`
        : `Passport ranking data is updated regularly on our Passport Index.`,
    },
    {
      question: "Is this list updated for 2026?",
      answer: "Yes. We sync visa policy changes weekly from official government sources, IATA, and embassy publications.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title={title} description={description} canonical={canonical}
        keywords={[
          `${passport.name} passport`,
          `${passport.name} visa free countries`,
          `${passport.name} passport visa free 2026`,
          "visa free travel",
          "passport ranking",
        ]} />
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://visas.guide/" },
        { name: "Passport Index", url: "https://visas.guide/passport-index" },
        { name: `${passport.name} Passport`, url: canonical },
      ]} />
      <FAQSchema faqs={faqs} pageUrl={canonical} />

      <Header />
      <main className="flex-1 bg-background">
        <section className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-10 max-w-5xl">
            <Badge className="mb-3">Updated 2026</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
              <span className="text-4xl">{passport.flag_emoji}</span>
              {passport.name} Passport: Visa-Free Countries
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Complete 2026 list of every country {passport.name} passport holders can visit
              visa-free, with visa on arrival, or with an eVisa.
              {passport.passport_rank ? ` Currently ranked #${passport.passport_rank} worldwide.` : ""}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {groups.map((g) => (
              <Card key={g.key} className={g.bg}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-1">
                    <g.icon className={`h-4 w-4 ${g.color}`} />
                    <span className="text-xs text-muted-foreground">{g.label}</span>
                  </div>
                  <div className={`text-3xl font-bold ${g.color}`}>{counts[g.key]}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-6">
            {groups.map((g) => (
              <Card key={g.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <g.icon className={`h-5 w-5 ${g.color}`} />
                    {g.label}
                    <Badge variant="secondary">{grouped[g.key].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {grouped[g.key].length === 0 ? (
                    <p className="text-sm text-muted-foreground">No destinations in this category.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {grouped[g.key].map((c) => (
                        <Link
                          key={c.id}
                          to={`/countries/${c.slug}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-md border hover:border-primary hover:bg-accent transition-colors text-sm"
                        >
                          <span>{c.flag_emoji}</span>
                          <span className="truncate">{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 prose prose-slate dark:prose-invert max-w-none">
            <h2>About the {passport.name} passport in 2026</h2>
            <p>
              The {passport.name} passport currently provides access to{" "}
              <strong>{visaFreeTotal} destinations</strong> without requiring a traditional
              embassy visa — {counts.visa_free} fully visa-free,{" "}
              {counts.visa_on_arrival} with visa on arrival, and {counts.e_visa} via eVisa.
              For {counts.visa_required} other countries, a visa must be obtained in
              advance before travel.
            </p>
            <p>
              Need a calculator for European stays? Try our{" "}
              <Link to="/schengen-calculator">Schengen 90/180 Day Calculator</Link>. For
              global rankings, see the <Link to="/passport-index">Passport Index</Link>.
            </p>

            <h2>Frequently asked questions</h2>
            {faqs.map((f) => (
              <div key={f.question}>
                <h3>{f.question}</h3>
                <p>{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PassportVisaFree;
