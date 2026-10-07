import { useCountries } from "@/hooks/useSharedData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Globe2 } from "lucide-react";

const REGION_ORDER = ["Europe", "Asia", "North America", "Africa", "Oceania", "South America"];
const PER_REGION = 10;

/**
 * Pre-footer SEO links section.
 * Organized by continent in tidy columns + a visa-type / tools row.
 * Lives above the dark footer panel on every page.
 */
const SeoLinksSection = () => {
  const { data: allCountries } = useCountries();
  const countries = (allCountries || [])
    .filter((c) => c.continent != null)
    .sort((a, b) => (b.annual_tourists ?? -1) - (a.annual_tourists ?? -1))
    .slice(0, 300);

  if (!countries?.length) return null;

  const grouped: Record<string, typeof countries> = {};
  for (const c of countries) {
    const key = c.continent as string;
    if (!grouped[key]) grouped[key] = [];
    if (grouped[key].length < PER_REGION) grouped[key].push(c);
  }

  const visaTools = [
    { label: "Tourist Visa Requirements", url: "/visa-types/tourist" },
    { label: "Business Visa Requirements", url: "/visa-types/business" },
    { label: "Student Visa Requirements", url: "/visa-types/student" },
    { label: "Schengen Visa Guide", url: "/schengen-visa-guide" },
    { label: "Passport Power Ranking", url: "/passport-index" },
    { label: "Visa Processing Times", url: "/processing-times" },
    { label: "Search Visa Requirements", url: "/requirements" },
    { label: "All Countries", url: "/countries" },
  ];

  return (
    <section className="bg-[#e8eaed] border-t border-[#d1d5db]">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Globe2 className="h-4 w-4 text-gray-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Browse visa requirements by country
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8">
          {REGION_ORDER.filter((r) => grouped[r]?.length).map((region) => (
            <div key={region}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{region}</h3>
              <ul className="space-y-1.5">
                {grouped[region].map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={`/countries/${c.slug}`}
                      className="text-xs text-gray-900 hover:text-blue-500 transition-colors"
                    >
                      {c.name} Visa Requirements
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[#e8eaed]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Visa types & tools
          </h3>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {visaTools.map((l) => (
              <Link
                key={l.url}
                to={l.url}
                className="text-xs text-gray-900 hover:text-blue-500 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoLinksSection;
