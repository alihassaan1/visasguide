import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/etias", label: "Overview", end: true },
  { to: "/etias/requirements", label: "Requirements" },
  { to: "/etias/application", label: "How to Apply" },
  { to: "/etias/cost", label: "Cost" },
  { to: "/etias/processing-time", label: "Processing Time" },
  { to: "/etias/schengen-countries", label: "Schengen Countries" },
  { to: "/etias/countries", label: "Eligible Nationalities" },
  { to: "/etias/vs-schengen-visa", label: "ETIAS vs Schengen Visa" },
  { to: "/etias/vs-esta", label: "ETIAS vs ESTA" },
  { to: "/etias/after-brexit", label: "After Brexit (UK)" },
  { to: "/etias/for-families", label: "For Families" },
  { to: "/etias/renewal", label: "Renewal" },
  { to: "/etias/denied", label: "If Denied" },
  { to: "/etias/schengen-itineraries", label: "Itineraries" },
  { to: "/etias/timeline", label: "Timeline" },
  { to: "/etias/faq", label: "FAQ" },
  { to: "/etias/news", label: "News" },
];

const EtiasNav = () => (
  <nav className="sticky top-16 z-30 -mx-4 sm:mx-0 mb-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
    <div className="overflow-x-auto">
      <ul className="flex gap-1 px-4 sm:px-0 py-2 whitespace-nowrap text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "px-3 py-1.5 rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);

export default EtiasNav;
