import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileCheck, Clock, DollarSign, Calendar } from "lucide-react";

interface VisaRecapProps {
  countryId: string;
  countrySlug: string;
  countryName: string;
  className?: string;
}

const VisaRecap = ({ countryId, countrySlug, countryName, className = '' }: VisaRecapProps) => {
  // Fetch visa requirements summary for popular passport holders
  const { data: visaSummary } = useQuery({
    queryKey: ['visa-summary', countryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_requirements')
        .select(`
          requirement_type,
          max_stay_days,
          fee_usd,
          from_country:countries!visa_requirements_from_country_id_fkey(name, slug, code, flag_emoji)
        `)
        .eq('to_country_id', countryId)
        .in('from_country_id', [
          // Popular passport countries (US, UK, India, Germany, UAE, etc.)
        ])
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!countryId
  });

  // Get aggregated stats
  const { data: visaStats } = useQuery({
    queryKey: ['visa-stats', countryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visa_requirements')
        .select('requirement_type, max_stay_days, fee_usd')
        .eq('to_country_id', countryId);

      if (error) throw error;

      const visaFreeCount = data?.filter(v => 
        ['visa_free', 'visa_on_arrival', 'eTA_required'].includes(v.requirement_type)
      ).length || 0;
      
      const visaRequiredCount = data?.filter(v => 
        v.requirement_type === 'visa_required'
      ).length || 0;

      const avgStay = data?.filter(v => v.max_stay_days)
        .reduce((acc, v) => acc + (v.max_stay_days || 0), 0) / (data?.filter(v => v.max_stay_days).length || 1);

      return {
        visaFreeCount,
        visaRequiredCount,
        avgStayDays: Math.round(avgStay) || 90,
        totalCountries: data?.length || 0
      };
    },
    enabled: !!countryId
  });

  const getRequirementBadge = (type: string) => {
    const styles: Record<string, string> = {
      visa_free: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      visa_on_arrival: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      eTA_required: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      evisa_required: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      visa_required: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return styles[type] || 'bg-muted text-muted-foreground';
  };

  const formatType = (type: string) => {
    const labels: Record<string, string> = {
      visa_free: 'Visa Free',
      visa_on_arrival: 'Visa on Arrival',
      eTA_required: 'eTA Required',
      evisa_required: 'eVisa Required',
      visa_required: 'Visa Required',
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Visa Quick Reference</h3>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {visaStats?.visaFreeCount || '—'}
            </div>
            <div className="text-xs text-muted-foreground">Visa-Free Access</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {visaStats?.avgStayDays || 90}<span className="text-sm">d</span>
            </div>
            <div className="text-xs text-muted-foreground">Typical Stay</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {visaStats?.visaRequiredCount || '—'}
            </div>
            <div className="text-xs text-muted-foreground">Visa Required</div>
          </div>
        </div>

        {/* Popular Passport Holders */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-muted-foreground">Common Requirements:</p>
          <div className="flex flex-wrap gap-2">
            {['US', 'UK', 'IN', 'DE', 'AE'].map(code => {
              const countryNames: Record<string, string> = {
                US: 'USA',
                UK: 'UK',
                IN: 'India',
                DE: 'Germany',
                AE: 'UAE'
              };
              return (
                <Link 
                  key={code}
                  to={`/visa-requirements/${code.toLowerCase()}-to-${countrySlug}-visa-requirements`}
                  className="text-xs px-2 py-1 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                >
                  {countryNames[code]} →
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Link 
          to={`/countries/${countrySlug}`}
          className="block text-center text-sm text-primary hover:underline font-medium"
        >
          View Full {countryName} Visa Requirements →
        </Link>
      </CardContent>
    </Card>
  );
};

export default VisaRecap;
