import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import FAQSchema from "@/components/FAQSchema";
import EtiasLayout from "@/components/etias/EtiasLayout";
import EtiasQuickFacts, { ETIAS_FACTS } from "@/components/etias/EtiasQuickFacts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, FileText, CreditCard, Clock, MapPin } from "lucide-react";

const faqs = [
  { question: "What is ETIAS?", answer: "ETIAS (European Travel Information and Authorisation System) is a pre-travel authorisation that visa-exempt nationals will need to enter 30 Schengen-area countries. It launches in the last quarter of 2026." },
  { question: "How much does ETIAS cost?", answer: `ETIAS costs €${ETIAS_FACTS.fee.replace("€","")} per application. Applicants under 18 and over 70 are exempt from the fee but still need to apply.` },
  { question: "How long is ETIAS valid?", answer: `Up to ${ETIAS_FACTS.validityYears} years, or until your passport expires — whichever comes first. It allows unlimited entries within that period.` },
  { question: "Is ETIAS a visa?", answer: "No. ETIAS is a travel authorisation linked to your passport, similar to the US ESTA. You can still be refused entry at the border even with valid ETIAS." },
  { question: "How long does ETIAS take to process?", answer: "Most applications are approved within minutes. In rare cases, manual review can take up to 30 days, so apply at least a few weeks before travel." },
  { question: "Which countries require ETIAS?", answer: "All 30 European countries in the Schengen area, including France, Germany, Italy, Spain, Greece, the Netherlands, Portugal, Austria, and Switzerland." },
];

const quickLinks = [
  { to: "/etias/requirements", title: "Requirements", desc: "Documents you'll need", icon: FileText },
  { to: "/etias/application", title: "How to apply", desc: "Step-by-step walkthrough", icon: CheckCircle2 },
  { to: "/etias/cost", title: "Cost & exemptions", desc: `${ETIAS_FACTS.fee} fee breakdown`, icon: CreditCard },
  { to: "/etias/processing-time", title: "Processing time", desc: "How long it takes", icon: Clock },
  { to: "/etias/schengen-countries", title: "Schengen countries", desc: `The ${ETIAS_FACTS.schengenCountries} countries`, icon: MapPin },
  { to: "/etias/timeline", title: "Launch timeline", desc: "History of delays", icon: Clock },
];

const popularCountries = [
  { slug: "united-states", name: "United States" },
  { slug: "united-kingdom", name: "United Kingdom" },
  { slug: "canada", name: "Canada" },
  { slug: "australia", name: "Australia" },
  { slug: "japan", name: "Japan" },
];

const EtiasHub = () => (
  <EtiasLayout breadcrumbs={[{ name: "ETIAS", url: "/etias" }]}>
    <SEOHead
      title={`ETIAS 2026 — Complete Guide to Europe's New ${ETIAS_FACTS.fee} Travel Authorisation`}
      description={`Everything about ETIAS: ${ETIAS_FACTS.fee} fee, ${ETIAS_FACTS.validityYears}-year validity, who needs it, how to apply, and the ${ETIAS_FACTS.launchWindow} launch date.`}
      canonical="https://visas.guide/etias"
      keywords={["ETIAS", "ETIAS 2026", "European travel authorisation", "Schengen ETIAS", "ETIAS fee", "ETIAS application"]}
    />
    <FAQSchema faqs={faqs} pageUrl="https://visas.guide/etias" />

    <header>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
        ETIAS: Europe's New Travel Authorisation
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl">
        Starting in {ETIAS_FACTS.launchWindow}, visa-exempt travellers will need an approved ETIAS to enter
        any of the {ETIAS_FACTS.schengenCountries} Schengen countries. Here's what it costs, who needs it, and how to apply.
      </p>
    </header>

    <EtiasQuickFacts />

    <section className="prose prose-slate dark:prose-invert max-w-none">
      <h2 className="mt-12">What is ETIAS?</h2>
      <p>
        ETIAS — the European Travel Information and Authorisation System — is the EU's answer
        to systems like the US ESTA and UK ETA. It is <strong>not a visa</strong>. It's an electronic
        pre-screening linked to your passport that confirms you're eligible to enter the
        Schengen area visa-free.
      </p>
      <p>
        If your nationality is currently allowed to enter the EU without a visa for short
        stays (up to {ETIAS_FACTS.maxStayDays} days in any {ETIAS_FACTS.maxStayWindowDays}-day period),
        you'll need ETIAS once it launches. That covers around {ETIAS_FACTS.eligibleNationalities} nationalities,
        including travellers from the United States, United Kingdom, Canada, Australia, and Japan.
      </p>

      <h2 className="mt-12">Who needs ETIAS?</h2>
      <p>
        Anyone holding a passport from a visa-waiver country who wants to visit a Schengen
        member state for tourism, business, transit, or short medical treatment. Children and
        seniors still need to apply — only the {ETIAS_FACTS.fee} fee is waived for them.
      </p>

      <h2 className="mt-12">When does ETIAS launch?</h2>
      <p>
        The official launch window is <strong>{ETIAS_FACTS.launchWindow}</strong>. The
        rollout has been delayed multiple times since 2021 to align with the EU Entry/Exit
        System (EES), which goes live first. See our{" "}
        <Link to="/etias/timeline" className="text-primary hover:underline">launch timeline</Link>{" "}
        for the full history.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4">Explore ETIAS</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map(({ to, title, desc, icon: Icon }) => (
          <Link key={to} to={to}>
            <Card className="p-5 h-full hover:shadow-md transition-shadow hover:border-primary/40">
              <Icon className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4">ETIAS by nationality</h2>
      <p className="text-muted-foreground mb-4">
        Country-specific guides covering eligibility, special rules, and step-by-step applications.
      </p>
      <div className="flex flex-wrap gap-2">
        {popularCountries.map((c) => (
          <Button key={c.slug} asChild variant="outline" size="sm">
            <Link to={`/etias/for/${c.slug}`}>
              ETIAS for {c.name} <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        ))}
        <Button asChild variant="ghost" size="sm">
          <Link to="/etias/countries">See all {ETIAS_FACTS.eligibleNationalities}+ nationalities →</Link>
        </Button>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <Card key={f.question} className="p-5">
            <h3 className="font-semibold text-foreground">{f.question}</h3>
            <p className="text-sm text-muted-foreground mt-2">{f.answer}</p>
          </Card>
        ))}
      </div>
    </section>
  </EtiasLayout>
);

export default EtiasHub;
