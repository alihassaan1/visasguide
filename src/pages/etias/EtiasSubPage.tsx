import { useParams } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import FAQSchema from "@/components/FAQSchema";
import EtiasLayout from "@/components/etias/EtiasLayout";
import { ETIAS_SUB_PAGES } from "@/lib/etiasContent";
import NotFound from "@/pages/NotFound";
import { Card } from "@/components/ui/card";

const EtiasSubPage = ({ slug: slugProp }: { slug?: string }) => {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug ?? "";
  const page = ETIAS_SUB_PAGES[slug];

  if (!page) return <NotFound />;

  const canonical = `https://visas.guide/etias/${page.slug}`;

  return (
    <EtiasLayout
      breadcrumbs={[
        { name: "ETIAS", url: "/etias" },
        { name: page.h1, url: `/etias/${page.slug}` },
      ]}
    >
      <SEOHead
        title={page.title}
        description={page.seoDescription}
        canonical={canonical}
        keywords={page.keywords}
      />
      {page.faqs && <FAQSchema faqs={page.faqs} pageUrl={canonical} />}

      <header>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
          {page.h1}
        </h1>
        <p className="text-lg text-muted-foreground">{page.intro}</p>
      </header>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="mt-12">{s.heading}</h2>
            {s.body && <p>{s.body}</p>}
            {s.list && (
              <ul>
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      {page.faqs && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
          <div className="space-y-3">
            {page.faqs.map((f) => (
              <Card key={f.question} className="p-5">
                <h3 className="font-semibold text-foreground">{f.question}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.answer}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </EtiasLayout>
  );
};

export default EtiasSubPage;
