import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Grid, List, ArrowUpDown } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { countryCodeToFlagEmoji } from "@/lib/utils";
import { ResidencyType } from "./ResidencyToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VisaStatusGridProps {
  fromCountryId?: string;
  fromCountrySlug?: string;
  residency?: ResidencyType;
  className?: string;
}

type VisaStatusFilter = "all" | "visa_free" | "evisa" | "voa" | "visa_required";
type SortOption = "name" | "status" | "stay_days";

const statusConfig = {
  visa_free: {
    label: "Visa Free",
    color: "bg-green-500 text-white",
    bgLight: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    emoji: "🟢"
  },
  visa_on_arrival: {
    label: "VOA",
    color: "bg-amber-500 text-white",
    bgLight: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    emoji: "🟠"
  },
  evisa_required: {
    label: "eVisa",
    color: "bg-blue-500 text-white",
    bgLight: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    emoji: "🔵"
  },
  eTA_required: {
    label: "eTA",
    color: "bg-sky-500 text-white",
    bgLight: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800",
    emoji: "🔵"
  },
  visa_required: {
    label: "Visa Required",
    color: "bg-red-500 text-white",
    bgLight: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    emoji: "🔴"
  }
};

const VisaStatusGrid = ({ fromCountryId, fromCountrySlug, residency = "none", className }: VisaStatusGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VisaStatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch visa requirements for the country
  const { data: visaData = [], isLoading } = useQuery({
    queryKey: ["visa-status-grid", fromCountryId],
    queryFn: async () => {
      if (!fromCountryId) return [];
      
      const { data, error } = await supabase
        .from("visa_requirements")
        .select(`
          *,
          to_country:countries!visa_requirements_to_country_id_fkey(
            id, name, code, slug, flag_emoji, continent, region
          )
        `)
        .eq("from_country_id", fromCountryId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!fromCountryId
  });

  // Filter and sort the data
  const filteredData = useMemo(() => {
    let filtered = [...visaData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.to_country?.name?.toLowerCase().includes(query) ||
        item.to_country?.region?.toLowerCase().includes(query) ||
        item.to_country?.continent?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => {
        if (statusFilter === "visa_free") {
          return item.requirement_type === "visa_free";
        } else if (statusFilter === "evisa") {
          return item.requirement_type === "evisa_required" || item.requirement_type === "eTA_required";
        } else if (statusFilter === "voa") {
          return item.requirement_type === "visa_on_arrival";
        } else if (statusFilter === "visa_required") {
          return item.requirement_type === "visa_required";
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return (a.to_country?.name || "").localeCompare(b.to_country?.name || "");
      } else if (sortBy === "status") {
        const order = ["visa_free", "visa_on_arrival", "evisa_required", "eTA_required", "visa_required"];
        return order.indexOf(a.requirement_type) - order.indexOf(b.requirement_type);
      } else if (sortBy === "stay_days") {
        return (b.max_stay_days || 0) - (a.max_stay_days || 0);
      }
      return 0;
    });

    return filtered;
  }, [visaData, searchQuery, statusFilter, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const visaFree = visaData.filter(v => v.requirement_type === "visa_free").length;
    const evisa = visaData.filter(v => v.requirement_type === "evisa_required" || v.requirement_type === "eTA_required").length;
    const voa = visaData.filter(v => v.requirement_type === "visa_on_arrival").length;
    const required = visaData.filter(v => v.requirement_type === "visa_required").length;
    return { visaFree, evisa, voa, required, total: visaData.length };
  }, [visaData]);

  const getStatusConfig = (type: string) => {
    return statusConfig[type as keyof typeof statusConfig] || statusConfig.visa_required;
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(15)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!fromCountryId) {
    return null;
  }

  return (
    <div className={className}>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className={`${statusConfig.visa_free.bgLight} border cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setStatusFilter(statusFilter === "visa_free" ? "all" : "visa_free")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.visaFree}</div>
            <div className="text-xs text-muted-foreground">Visa Free</div>
          </CardContent>
        </Card>
        <Card className={`${statusConfig.evisa_required.bgLight} border cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setStatusFilter(statusFilter === "evisa" ? "all" : "evisa")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.evisa}</div>
            <div className="text-xs text-muted-foreground">eVisa/eTA</div>
          </CardContent>
        </Card>
        <Card className={`${statusConfig.visa_on_arrival.bgLight} border cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setStatusFilter(statusFilter === "voa" ? "all" : "voa")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.voa}</div>
            <div className="text-xs text-muted-foreground">Visa on Arrival</div>
          </CardContent>
        </Card>
        <Card className={`${statusConfig.visa_required.bgLight} border cursor-pointer hover:shadow-md transition-shadow`} onClick={() => setStatusFilter(statusFilter === "visa_required" ? "all" : "visa_required")}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.required}</div>
            <div className="text-xs text-muted-foreground">Visa Required</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="stay_days">Stay Duration</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "visa_free", "evisa", "voa", "visa_required"].map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter as VisaStatusFilter)}
            className="text-xs"
          >
            {filter === "all" && "All Countries"}
            {filter === "visa_free" && "🟢 Visa Free"}
            {filter === "evisa" && "🔵 eVisa/eTA"}
            {filter === "voa" && "🟠 Visa on Arrival"}
            {filter === "visa_required" && "🔴 Visa Required"}
          </Button>
        ))}
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredData.length} of {stats.total} destinations
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredData.map((item) => {
            const config = getStatusConfig(item.requirement_type);
            const country = item.to_country;
            if (!country) return null;

            return (
              <Link
                key={item.id}
                to={`/visa-requirements/${fromCountrySlug}/${country.slug}`}
                className="group"
              >
                <Card className={`${config.bgLight} border hover:shadow-lg transition-all hover:-translate-y-1`}>
                  <CardContent className="p-3 text-center">
                    <div className="text-3xl mb-2">
                      {country.flag_emoji || countryCodeToFlagEmoji(country.code) || "🏳️"}
                    </div>
                    <h3 className="font-medium text-sm text-foreground truncate">
                      {country.name}
                    </h3>
                    <Badge className={`${config.color} mt-2 text-xs`}>
                      {config.label}
                    </Badge>
                    {item.max_stay_days && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.max_stay_days} days
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredData.map((item) => {
            const config = getStatusConfig(item.requirement_type);
            const country = item.to_country;
            if (!country) return null;

            return (
              <Link
                key={item.id}
                to={`/visa-requirements/${fromCountrySlug}/${country.slug}`}
              >
                <Card className={`${config.bgLight} border hover:shadow-md transition-all`}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {country.flag_emoji || countryCodeToFlagEmoji(country.code) || "🏳️"}
                      </span>
                      <div>
                        <h3 className="font-medium text-foreground">{country.name}</h3>
                        <p className="text-xs text-muted-foreground">{country.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.max_stay_days && (
                        <span className="text-sm text-muted-foreground">
                          {item.max_stay_days} days
                        </span>
                      )}
                      <Badge className={config.color}>{config.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisaStatusGrid;
