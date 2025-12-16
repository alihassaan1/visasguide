import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Info, Bell } from "lucide-react";

interface VisaAlertTickerProps {
  countryId?: string;
  countryName?: string;
}

const VisaAlertTicker = ({ countryId, countryName }: VisaAlertTickerProps) => {
  const { data: alerts } = useQuery({
    queryKey: ['visa-alerts', countryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'visa_alerts')
        .maybeSingle();
      
      if (error) throw error;
      
      const allAlerts = (data?.setting_value as any[]) || [];
      
      // Filter alerts for this country or global alerts
      return allAlerts.filter((alert: any) => 
        alert.is_active && 
        (!alert.country_id || alert.country_id === countryId || alert.is_global)
      );
    },
    enabled: true
  });

  if (!alerts || alerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ban': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'update': return <Bell className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'ban': return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      case 'update': return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      default: return 'bg-primary/5 border-primary/20';
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert: any, index: number) => (
        <div 
          key={index}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${getAlertStyle(alert.type)}`}
        >
          {getAlertIcon(alert.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {alert.message.replace('{country}', countryName || 'this country')}
            </p>
            {alert.effective_date && (
              <p className="text-xs text-muted-foreground">
                Effective: {new Date(alert.effective_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VisaAlertTicker;
