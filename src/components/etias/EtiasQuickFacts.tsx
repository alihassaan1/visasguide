import { Card } from "@/components/ui/card";
import { Euro, Clock, CalendarCheck, Plane } from "lucide-react";

// Single source of truth for ETIAS facts (fee, validity, etc.)
export const ETIAS_FACTS = {
  fee: "€20",
  feeExemptUnder: 18,
  feeExemptOver: 70,
  validityYears: 3,
  validityNote: "or until passport expires",
  processingMinutes: "Minutes to 30 days",
  maxStayDays: 90,
  maxStayWindowDays: 180,
  launchWindow: "Q4 2026",
  schengenCountries: 30,
  eligibleNationalities: 60,
} as const;

const items = [
  { icon: Euro, label: "Fee", value: ETIAS_FACTS.fee, sub: "Free under 18 & over 70" },
  { icon: CalendarCheck, label: "Validity", value: `${ETIAS_FACTS.validityYears} years`, sub: ETIAS_FACTS.validityNote },
  { icon: Clock, label: "Processing", value: "Minutes", sub: "Up to 30 days in rare cases" },
  { icon: Plane, label: "Max stay", value: `${ETIAS_FACTS.maxStayDays} days`, sub: `Per ${ETIAS_FACTS.maxStayWindowDays}-day window` },
];

const EtiasQuickFacts = () => (
  <Card className="p-6 bg-card">
    <h2 className="text-lg font-semibold mb-4">ETIAS Quick Facts</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, label, value, sub }) => (
        <div key={label} className="flex flex-col gap-1">
          <Icon className="h-5 w-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <span className="text-xl font-bold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
      ))}
    </div>
  </Card>
);

export default EtiasQuickFacts;
