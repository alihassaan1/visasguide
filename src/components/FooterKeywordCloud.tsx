import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

/**
 * SEO-focused keyword cloud rendered inside the footer.
 * Pulls top countries from the DB and emits exact-match anchor text
 * variations linking to the relevant money pages.
 */
const FooterKeywordCloud = () => {
  const { data: countries } = useQuery({
    queryKey: ["footer-keyword-countries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("countries")
        .select("name, slug")
        .order("annual_tourists", { ascending: false, nullsFirst: false })
        .limit(40);
      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });

  if (!countries?.length) return null;

  const visaTypeLinks = [
    { label: "Tourist Visa Requirements", url: "/visa-types/tourist" },
    { label: "Business Visa Requirements", url: "/visa-types/business" },
    { label: "Student Visa Requirements", url: "/visa-types/student" },
    { label: "Schengen Visa Guide", url: "/schengen-visa-guide" },
    { label: "Passport Power Ranking", url: "/passport-index" },
    { label: "Visa Processing Times", url: "/processing-times" },
  ];

  return (
    <div className="border-t border-primary-foreground/10 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-primary-foreground mb-3 text-sm uppercase tracking-wider">
            Popular Country Visa Guides
          </h4>
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs">
            {countries.map((c) => (
              <Link
                key={c.slug}
                to={`/countries/${c.slug}`}
                className="text-primary-foreground/70 hover:text-primary-foreground hover:underline transition-colors"
              >
                {c.name} Visa Requirements
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-primary-foreground mb-3 text-sm uppercase tracking-wider">
            Visa Types & Tools
          </h4>
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs">
            {visaTypeLinks.map((l) => (
              <Link
                key={l.url}
                to={l.url}
                className="text-primary-foreground/70 hover:text-primary-foreground hover:underline transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterKeywordCloud;
