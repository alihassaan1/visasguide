import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Trophy, DollarSign, Calendar, Globe } from "lucide-react";

interface TravelStatisticsProps {
  country: {
    name: string;
    annual_tourists?: number | null;
    tourism_rank?: number | null;
    tourism_revenue_usd?: number | null;
    top_source_countries?: string[] | null;
    peak_travel_months?: string | null;
    tourism_growth_percent?: number | null;
  };
}

const TravelStatistics = ({ country }: TravelStatisticsProps) => {
  // Don't render if no travel stats available
  const hasStats = country.annual_tourists || country.tourism_rank || country.tourism_revenue_usd;
  
  if (!hasStats) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const growthPercent = country.tourism_growth_percent;
  const isPositiveGrowth = growthPercent && growthPercent > 0;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Travel Statistics for {country.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {country.annual_tourists && (
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(country.annual_tourists)}
              </div>
              <div className="text-xs text-muted-foreground">Tourists/Year</div>
            </div>
          )}
          
          {country.tourism_rank && (
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold text-amber-600">
                #{country.tourism_rank}
              </div>
              <div className="text-xs text-muted-foreground">Global Rank</div>
            </div>
          )}
          
          {country.tourism_revenue_usd && (
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                ${formatNumber(country.tourism_revenue_usd)}
              </div>
              <div className="text-xs text-muted-foreground">Revenue (USD)</div>
            </div>
          )}
          
          {growthPercent !== null && growthPercent !== undefined && (
            <div className={`bg-gradient-to-br ${isPositiveGrowth ? 'from-emerald-500/10 to-emerald-500/5' : 'from-red-500/10 to-red-500/5'} rounded-lg p-4 text-center`}>
              {isPositiveGrowth ? (
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
              ) : (
                <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
              )}
              <div className={`text-2xl font-bold ${isPositiveGrowth ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositiveGrowth ? '+' : ''}{growthPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">YoY Growth</div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="space-y-4">
          {country.top_source_countries && country.top_source_countries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Top Visitor Origins:</span>
              {country.top_source_countries.map((source, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          )}
          
          {country.peak_travel_months && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Peak Season:</span>
              <span className="text-sm font-medium">{country.peak_travel_months}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelStatistics;
