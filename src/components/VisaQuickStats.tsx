import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Globe, Plane, FileText, Clock, Calendar, DollarSign, AlertCircle } from "lucide-react";

interface VisaQuickStatsProps {
  requirementType: string;
  maxStayDays?: number | null;
  processingTimeDays?: number | null;
  feeUsd?: number | null;
}

const VisaQuickStats = ({ 
  requirementType, 
  maxStayDays, 
  processingTimeDays, 
  feeUsd 
}: VisaQuickStatsProps) => {
  
  const getVisaTypeConfig = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'visa free':
      case 'visa_free':
        return {
          label: 'Visa Free',
          icon: CheckCircle,
          bgClass: 'bg-visa-success/10',
          textClass: 'text-visa-success',
          borderClass: 'border-visa-success/30'
        };
      case 'evisa':
      case 'e_visa':
        return {
          label: 'eVisa',
          icon: Globe,
          bgClass: 'bg-visa-info/10',
          textClass: 'text-visa-info',
          borderClass: 'border-visa-info/30'
        };
      case 'visa on arrival':
      case 'visa_on_arrival':
        return {
          label: 'Visa on Arrival',
          icon: Plane,
          bgClass: 'bg-visa-warning/10',
          textClass: 'text-visa-warning',
          borderClass: 'border-visa-warning/30'
        };
      case 'visa required':
      case 'visa_required':
        return {
          label: 'Visa Required',
          icon: FileText,
          bgClass: 'bg-visa-error/10',
          textClass: 'text-visa-error',
          borderClass: 'border-visa-error/30'
        };
      default:
        return {
          label: 'Unknown',
          icon: AlertCircle,
          bgClass: 'bg-muted',
          textClass: 'text-muted-foreground',
          borderClass: 'border-border'
        };
    }
  };

  const visaConfig = getVisaTypeConfig(requirementType);
  const VisaIcon = visaConfig.icon;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Visa Type */}
      <Card className={`border ${visaConfig.borderClass} ${visaConfig.bgClass}`}>
        <CardContent className="p-4 text-center">
          <VisaIcon className={`h-6 w-6 mx-auto mb-2 ${visaConfig.textClass}`} />
          <p className={`text-lg font-bold ${visaConfig.textClass}`}>{visaConfig.label}</p>
          <p className="text-xs text-muted-foreground">Visa Type</p>
        </CardContent>
      </Card>

      {/* Max Stay */}
      <Card className="border">
        <CardContent className="p-4 text-center">
          <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-lg font-bold">
            {maxStayDays && maxStayDays > 0 ? `${maxStayDays} days` : '—'}
          </p>
          <p className="text-xs text-muted-foreground">Max Stay</p>
        </CardContent>
      </Card>

      {/* Processing Time */}
      <Card className="border">
        <CardContent className="p-4 text-center">
          <Clock className="h-6 w-6 mx-auto mb-2 text-visa-warning" />
          <p className="text-lg font-bold">
            {processingTimeDays && processingTimeDays > 0 
              ? (processingTimeDays === 1 ? 'Instant' : `${processingTimeDays} days`) 
              : '—'}
          </p>
          <p className="text-xs text-muted-foreground">Processing</p>
        </CardContent>
      </Card>

      {/* Fee */}
      <Card className="border">
        <CardContent className="p-4 text-center">
          <DollarSign className="h-6 w-6 mx-auto mb-2 text-visa-success" />
          <p className="text-lg font-bold">
            {feeUsd && feeUsd > 0 ? `$${feeUsd}` : 'Free'}
          </p>
          <p className="text-xs text-muted-foreground">Visa Fee</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisaQuickStats;
