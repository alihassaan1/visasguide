import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSchema from "@/components/FAQSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { Link } from "@/lib/router-compat";

type Trip = { id: string; entry: string; exit: string };

const todayISO = () => new Date().toISOString().slice(0, 10);

const diffDaysInclusive = (a: Date, b: Date) =>
  Math.floor((b.getTime() - a.getTime()) / 86400000) + 1;

const parse = (s: string) => {
  const d = new Date(s + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
};

function daysUsed(trips: Trip[], reference: Date) {
  // Window: 180 days ending on reference (inclusive)
  const windowStart = new Date(reference);
  windowStart.setUTCDate(windowStart.getUTCDate() - 179);
  let used = 0;
  for (const t of trips) {
    const entry = parse(t.entry);
    const exit = parse(t.exit);
    if (!entry || !exit || exit < entry) continue;
    const s = entry < windowStart ? windowStart : entry;
    const e = exit > reference ? reference : exit;
    if (e < s) continue;
    used += diffDaysInclusive(s, e);
  }
  return used;
}

const faqs = [
  {
    question: "How does the Schengen 90/180 day rule work?",
    answer:
      "On any given day, you may have spent no more than 90 days inside the Schengen Area during the previous 180-day rolling period. The window moves forward each day, so older stays drop out as new days are added.",
  },
  {
    question: "Do entry and exit days count?",
    answer:
      "Yes. Both the day you enter and the day you exit the Schengen Area each count as a full day of stay, even if you only spend a few hours.",
  },
  {
    question: "Which countries are part of the Schengen Area in 2026?",
    answer:
      "There are 29 Schengen countries in 2026, including Bulgaria and Romania which joined fully on 1 January 2025. Ireland and Cyprus are EU members but are not in Schengen.",
  },
  {
    question: "What happens if I overstay?",
    answer:
      "Overstaying can lead to fines, deportation, and a multi-year entry ban to all Schengen states. Border officers calculate your stay using this exact 90/180 rolling rule.",
  },
];

const SchengenCalculator = () => {
  const [reference, setReference] = useState(todayISO());
  const [trips, setTrips] = useState<Trip[]>([
    { id: crypto.randomUUID(), entry: "", exit: "" },
  ]);

  const refDate = parse(reference) ?? new Date();
  const used = useMemo(() => daysUsed(trips, refDate), [trips, refDate]);
  const remaining = Math.max(0, 90 - used);
  const overstay = used > 90;

  const addTrip = () =>
    setTrips((t) => [...t, { id: crypto.randomUUID(), entry: "", exit: "" }]);
  const removeTrip = (id: string) =>
    setTrips((t) => (t.length === 1 ? t : t.filter((x) => x.id !== id)));
  const updateTrip = (id: string, field: "entry" | "exit", value: string) =>
    setTrips((t) => t.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Schengen 90/180 Day Calculator 2026 – Free Visa Stay Calculator | Visas.Guide"
        description="Free Schengen 90/180 day calculator. Track your stays across all 29 Schengen countries, see remaining days, and avoid overstay penalties. Updated for 2026."
        canonical="https://visas.guide/schengen-calculator"
        keywords={[
          "schengen calculator",
          "90/180 day rule",
          "schengen 90 180 calculator",
          "schengen short stay calculator",
          "schengen visa days remaining",
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://visas.guide/" },
          { name: "Tools", url: "https://visas.guide/" },
          { name: "Schengen Calculator", url: "https://visas.guide/schengen-calculator" },
        ]}
      />
      <FAQSchema faqs={faqs} />

      <Header />

      <main className="flex-1 bg-background">
        <section className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-10 max-w-5xl">
            <Badge className="mb-3">Free Tool · Updated 2026</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Schengen 90/180 Day Calculator
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Calculate exactly how many days you've spent in the Schengen Area and
              how many you have left. Works for all 29 Schengen countries including
              Bulgaria and Romania (full members since 2025).
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 max-w-5xl grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Your Schengen trips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="ref">Reference / planned date</Label>
                <Input
                  id="ref"
                  type="date"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1 max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We calculate days used in the 180-day window ending on this date.
                </p>
              </div>

              <div className="space-y-3">
                {trips.map((trip, i) => (
                  <div
                    key={trip.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end p-3 border rounded-lg"
                  >
                    <div>
                      <Label className="text-xs">Trip {i + 1} – Entry date</Label>
                      <Input
                        type="date"
                        value={trip.entry}
                        onChange={(e) => updateTrip(trip.id, "entry", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Exit date</Label>
                      <Input
                        type="date"
                        value={trip.exit}
                        onChange={(e) => updateTrip(trip.id, "exit", e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTrip(trip.id)}
                      disabled={trips.length === 1}
                      aria-label="Remove trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addTrip} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-1" /> Add another trip
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-24 h-fit">
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Days used (in window)</div>
                <div className="text-4xl font-bold">{used}<span className="text-base text-muted-foreground"> / 90</span></div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days remaining</div>
                <div className={`text-3xl font-bold ${overstay ? "text-destructive" : "text-primary"}`}>
                  {remaining}
                </div>
              </div>
              {overstay ? (
                <div className="flex gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Overstay detected. You've exceeded the 90-day limit by {used - 90} days.</span>
                </div>
              ) : (
                <div className="flex gap-2 p-3 bg-primary/10 text-primary rounded-md text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Within the 90/180 limit for this date.</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Indicative only. Border officers have final authority. Save stamps and boarding passes as proof of stay.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="container mx-auto px-4 pb-12 max-w-5xl prose prose-slate dark:prose-invert">
          <h2 className="mt-8">How the Schengen 90/180 day rule works</h2>
          <p>
            The Schengen short-stay rule lets non-EU visitors stay up to{" "}
            <strong>90 days within any rolling 180-day period</strong> across all 29
            Schengen countries combined. On any given day, border officers look back
            180 days and count every day you were inside the area — both entry and
            exit days count as full days.
          </p>
          <h2>Tips to avoid overstay</h2>
          <ul>
            <li>Always carry proof of entry and exit dates (boarding passes, stamps).</li>
            <li>Plan a buffer of 2–3 days before re-entering.</li>
            <li>Remember the 90 days are shared across all Schengen states — not 90 days per country.</li>
            <li>For longer stays, apply for a national long-stay (Type D) visa.</li>
          </ul>
          <p>
            Read our full <Link to="/schengen-visa-guide">Schengen Visa Guide</Link>{" "}
            for application steps, fees, and country-specific tips.
          </p>

          <h2>Frequently asked questions</h2>
          {faqs.map((f) => (
            <div key={f.question}>
              <h3>{f.question}</h3>
              <p>{f.answer}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SchengenCalculator;
