import { useParams, Link, Navigate } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import FAQSchema from "@/components/FAQSchema";
import GetYourGuideWidget from "@/components/GetYourGuideWidget";
import NewsletterSignup from "@/components/NewsletterSignup";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, MapPin, Compass, Lightbulb, FileText } from "lucide-react";
import { getThingsToDo } from "@/data/thingsToDo";

const categoryColors: Record<string, string> = {
  Culture: "bg-purple-100 text-purple-800",
  Nature: "bg-green-100 text-green-800",
  Food: "bg-orange-100 text-orange-800",
  Adventure: "bg-red-100 text-red-800",
  Beach: "bg-blue-100 text-blue-800",
  History: "bg-amber-100 text-amber-800",
};

const ThingsToDo = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const data = countrySlug ? getThingsToDo(countrySlug) : undefined;


  if (!data) {
    return <Navigate to="/404" replace />;
  }

  const canonical = `https://visas.guide/things-to-do/${data.slug}`;
  const title = `Things to Do in ${data.country}: Top Attractions & Activities (2026)`;
  const description = `Discover the top 10 things to do in ${data.country}: best attractions, when to visit, how to get around, travel tips, and answers to common questions.`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={title}
        description={description}
        canonical={canonical}
        keywords={[
          `things to do in ${data.country}`,
          `${data.country} attractions`,
          `${data.country} travel guide`,
          `visit ${data.country}`,
          `${data.country} tourism`,
        ]}
      />
      <FAQSchema faqs={data.faqs} pageUrl={canonical} />
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Hero / H1 */}
        <header className="mb-10">
          <p className="text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/things-to-do" className="hover:underline">Things to Do</Link>
            <span className="mx-2">/</span>
            <span>{data.country}</span>
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Things to Do in {data.country}: Top Attractions &amp; Activities
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {data.introduction}
          </p>
        </header>

        {/* Top 10 Attractions */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="h-7 w-7 text-primary" />
            Top 10 Attractions in {data.country}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.attractions.map((a, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {i + 1}. {a.name}
                    </h3>
                    <Badge variant="secondary" className={categoryColors[a.category] || ""}>
                      {a.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* GetYourGuide Widget */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Book Tours &amp; Activities in {data.country}
          </h2>
          <p className="text-muted-foreground mb-4">
            Skip the planning — these are the most popular bookable experiences in {data.country} right now.
          </p>
          <GetYourGuideWidget location={data.gygLocation} numberOfItems={6} />
        </section>

        {/* Best Time to Visit */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-primary" />
            Best Time to Visit {data.country}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {data.bestTimeToVisit}
          </p>
        </section>

        {/* Getting Around */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
            <Compass className="h-7 w-7 text-primary" />
            Getting Around {data.country}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {data.gettingAround}
          </p>
        </section>

        {/* Travel Tips */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-primary" />
            Travel Tips for {data.country}
          </h2>
          <ul className="space-y-2">
            {data.travelTips.map((tip, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Visa internal link */}
        <section className="mb-12">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div className="flex items-start gap-3">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    Planning a trip? Check {data.country} visa requirements
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find out whether you need a visa, processing times, and how to apply.
                  </p>
                </div>
              </div>
              <Link
                to={`/countries/${data.countrySlug}`}
                className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                View Visa Guide →
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {data.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Newsletter */}
        <section className="mb-12">
          <NewsletterSignup />
        </section>

        <AffiliateDisclosure />
      </main>

      <Footer />
    </div>
  );
};

export default ThingsToDo;
