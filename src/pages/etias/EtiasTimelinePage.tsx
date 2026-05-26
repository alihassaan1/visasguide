import SEOHead from "@/components/SEOHead";
import EtiasLayout from "@/components/etias/EtiasLayout";
import { Card } from "@/components/ui/card";
import { ETIAS_FACTS } from "@/components/etias/EtiasQuickFacts";

const events = [
  { date: "April 2016", title: "ETIAS first proposed", body: "The European Commission first proposed an EU travel authorisation system, modelled on the US ESTA." },
  { date: "September 2018", title: "ETIAS regulation adopted", body: "The EU formally adopted Regulation 2018/1240 establishing ETIAS. Initial launch target: 2021." },
  { date: "2021", title: "First delay", body: "Launch pushed to end-2022 due to IT-system delays at eu-LISA, the agency building the platform." },
  { date: "2022", title: "Second delay", body: "Launch rescheduled to May 2023 to align with the Entry/Exit System (EES) rollout." },
  { date: "2023", title: "Third delay", body: "Launch pushed to 2024, then to mid-2025, then to a 6-month period after EES went live." },
  { date: "October 2025", title: "EES launches", body: "The Entry/Exit System began phased rollout at EU external borders, replacing passport stamping with biometric registration." },
  { date: "Q4 2026", title: "ETIAS launch (current target)", body: `Official ETIAS launch in the final quarter of 2026, with a 6-month transitional period during which travel without ETIAS is still permitted. The ${ETIAS_FACTS.fee} fee will apply from the start.` },
  { date: "Mid-2027 (expected)", title: "ETIAS fully mandatory", body: "After the transitional grace period, ETIAS will be strictly enforced. Travellers without a valid authorisation will be denied boarding." },
];

const EtiasTimelinePage = () => (
  <EtiasLayout
    breadcrumbs={[
      { name: "ETIAS", url: "/etias" },
      { name: "Timeline", url: "/etias/timeline" },
    ]}
  >
    <SEOHead
      title="ETIAS Launch Timeline — Every Delay From 2018 to 2026"
      description={`Full history of ETIAS launch delays from the 2018 regulation to the ${ETIAS_FACTS.launchWindow} go-live. Updated as the EU publishes new dates.`}
      canonical="https://visas.guide/etias/timeline"
      keywords={["ETIAS timeline", "when does ETIAS launch", "ETIAS delays", "ETIAS launch date"]}
    />

    <header>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
        ETIAS launch timeline
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl">
        ETIAS has been delayed half a dozen times since 2018. Here's every major milestone and
        the current path to the {ETIAS_FACTS.launchWindow} launch.
      </p>
    </header>

    <ol className="relative border-l-2 border-border ml-3 space-y-6">
      {events.map((e, i) => (
        <li key={e.title} className="ml-6">
          <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
          <Card className="p-5">
            <div className="flex items-baseline justify-between gap-4 flex-wrap mb-1">
              <h2 className="font-semibold text-foreground">{e.title}</h2>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{e.date}</span>
            </div>
            <p className="text-sm text-muted-foreground">{e.body}</p>
          </Card>
        </li>
      ))}
    </ol>

    <section className="prose prose-slate dark:prose-invert max-w-none">
      <h2 className="mt-12">Why has ETIAS been delayed so often?</h2>
      <p>
        The main blocker has been the IT dependency chain. ETIAS shares infrastructure with
        the Entry/Exit System (EES), the Visa Information System (VIS), and the Schengen
        Information System (SIS). All four had to be upgraded in sequence, and EES itself
        slipped multiple times before going live in October 2025.
      </p>
      <p>
        Member-state border-control readiness is the other factor. Airports, ferry terminals,
        and land borders all need new biometric kiosks and trained staff before ETIAS can be
        enforced at scale.
      </p>
    </section>
  </EtiasLayout>
);

export default EtiasTimelinePage;
