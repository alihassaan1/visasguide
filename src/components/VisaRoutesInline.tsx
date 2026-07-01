import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RelatedVisaLinks from "./RelatedVisaLinks";

interface Props {
  slug: string;
}

/**
 * Detects `X-to-Y-visa-requirements` content-page slugs, resolves both
 * country records, and renders the RelatedVisaLinks block inline so
 * high-traffic route pages capture more internal clicks.
 */
const VisaRoutesInline = ({ slug }: Props) => {
  const match = slug?.match(/^([a-z0-9-]+)-to-([a-z0-9-]+)-visa-requirements$/i);
  const fromSlug = match?.[1];
  const toSlug = match?.[2];

  const { data } = useQuery({
    enabled: !!fromSlug && !!toSlug,
    queryKey: ["visa-route-countries", fromSlug, toSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("id, name, slug, code, flag_emoji")
        .in("slug", [fromSlug!, toSlug!]);
      if (error) throw error;
      const from = data?.find((c) => c.slug === fromSlug);
      const to = data?.find((c) => c.slug === toSlug);
      return from && to ? { from, to } : null;
    },
  });

  if (!match || !data) return null;

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="font-serif text-2xl font-bold mb-6">
        Explore more visa options
      </h2>
      <RelatedVisaLinks fromCountry={data.from} toCountry={data.to} />
    </section>
  );
};

export default VisaRoutesInline;
