import { useEffect, useState } from "react";
import { useParams, Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import FAQSchema from "@/components/FAQSchema";
import EtiasLayout from "@/components/etias/EtiasLayout";
import EtiasQuickFacts, { ETIAS_FACTS } from "@/components/etias/EtiasQuickFacts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/NotFound";

interface FaqItem { question: string; answer: string }
interface CountryPage {
  id: string;
  country_slug: string;
  country_name: string;
  nationality: string;
  intro: string | null;
  who_qualifies: string | null;
  special_notes: string | null;
  processing_details: string | null;
  faqs: FaqItem[] | null;
  seo_title: string | null;
  seo_description: string | null;
  featured_image_url: string | null;
  is_published: boolean;
}

const EtiasCountryPage = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const [data, setData] = useState<CountryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!countrySlug) return;
    setLoading(true);
    setNotFound(false);
    (async () => {
      const { data: row, error } = await supabase
        .from("etias_country_pages")
        .select("*")
        .eq("country_slug", countrySlug)
        .eq("is_published", true)
        .maybeSingle();
      if (error || !row) {
        setNotFound(true);
      } else {
        setData(row as unknown as CountryPage);
      }
      setLoading(false);
    })();
  }, [countrySlug]);

  if (notFound) return <NotFound />;

  const canonical = `https://visas.guide/etias/for/${countrySlug}`;
  const faqs: FaqItem[] = Array.isArray(data?.faqs) ? data!.faqs : [];

  return (
    <EtiasLayout
      breadcrumbs={[
        { name: "ETIAS", url: "/etias" },
        { name: data?.country_name ?? "Loading", url: `/etias/for/${countrySlug}` },
      ]}
    >
      {data && (
        <SEOHead
          title={data.seo_title || `ETIAS for ${data.nationality} Citizens — 2026 Guide`}
          description={
            data.seo_description ||
            `Complete ETIAS guide for ${data.nationality} passport holders: ${ETIAS_FACTS.fee} fee, eligibility, application steps, and processing time.`
          }
          canonical={canonical}
          ogImage={data.featured_image_url || undefined}
          keywords={[`ETIAS ${data.country_name}`, `${data.nationality} ETIAS`, "ETIAS application"]}
        />
      )}
      {faqs.length > 0 && <FAQSchema faqs={faqs} pageUrl={canonical} />}

      {loading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <header>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              ETIAS for {data.nationality} citizens
            </h1>
            {data.intro && <p className="text-lg text-muted-foreground max-w-3xl">{data.intro}</p>}
          </header>

          <EtiasQuickFacts />

          <article className="prose prose-slate dark:prose-invert max-w-none">
            {data.who_qualifies && (
              <>
                <h2 className="mt-12">Who qualifies in {data.country_name}</h2>
                <p>{data.who_qualifies}</p>
              </>
            )}
            {data.special_notes && (
              <>
                <h2 className="mt-12">Special notes for {data.nationality} travellers</h2>
                <p>{data.special_notes}</p>
              </>
            )}
            {data.processing_details && (
              <>
                <h2 className="mt-12">Processing time & application tips</h2>
                <p>{data.processing_details}</p>
              </>
            )}
            <h2 className="mt-12">Next steps</h2>
            <p>
              Read the full <Link to="/etias/application">step-by-step ETIAS application guide</Link>,
              double-check the <Link to="/etias/requirements">document requirements</Link>, and review
              the <Link to="/etias/cost">{ETIAS_FACTS.fee} fee breakdown</Link> before you apply.
            </p>
          </article>

          {faqs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">FAQs for {data.nationality} applicants</h2>
              <div className="space-y-3">
                {faqs.map((f) => (
                  <Card key={f.question} className="p-5">
                    <h3 className="font-semibold text-foreground">{f.question}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{f.answer}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </EtiasLayout>
  );
};

export default EtiasCountryPage;
