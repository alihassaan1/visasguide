import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Info, CreditCard, Plane } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ResidencyType = "none" | "us_resident" | "uk_resident" | "schengen_resident";

interface ResidencyToggleProps {
  value: ResidencyType;
  onChange: (value: ResidencyType) => void;
  compact?: boolean;
}

const residencyOptions = [
  {
    id: "us_resident",
    label: "US Green Card",
    icon: "🇺🇸",
    description: "I hold a valid US Green Card or permanent residency",
    benefits: "Access to 20+ additional visa-free destinations"
  },
  {
    id: "uk_resident",
    label: "UK Residency",
    icon: "🇬🇧",
    description: "I have UK indefinite leave to remain or valid visa",
    benefits: "Access to 15+ additional visa-free destinations"
  },
  {
    id: "schengen_resident",
    label: "Schengen Residency",
    icon: "🇪🇺",
    description: "I hold a valid Schengen area residence permit",
    benefits: "Travel freely within Schengen zone + additional benefits"
  }
];

const ResidencyToggle = ({ value, onChange, compact = false }: ResidencyToggleProps) => {
  const handleToggle = (residencyId: ResidencyType) => {
    if (value === residencyId) {
      onChange("none");
    } else {
      onChange(residencyId);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground mr-2">Residency:</span>
        {residencyOptions.map((option) => (
          <TooltipProvider key={option.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToggle(option.id as ResidencyType)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    value === option.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>{option.icon}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{option.benefits}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Do you hold residency in another country?</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>
                  Holding a valid residency in countries like the US, UK, or Schengen area 
                  can grant you visa-free or simplified entry to additional destinations.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {residencyOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleToggle(option.id as ResidencyType)}
              className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                value === option.id
                  ? "border-primary bg-primary/10 shadow-xs"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium text-sm text-foreground">{option.label}</span>
                </div>
                <Switch
                  checked={value === option.id}
                  onCheckedChange={() => handleToggle(option.id as ResidencyType)}
                  className="scale-90"
                />
              </div>
              <p className="text-xs text-muted-foreground">{option.description}</p>
              {value === option.id && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  <Plane className="h-3 w-3 mr-1" />
                  {option.benefits}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {value !== "none" && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                Results will be updated to show visa requirements based on your{" "}
                <strong>
                  {residencyOptions.find(o => o.id === value)?.label}
                </strong>{" "}
                status. Additional visa-free destinations will be highlighted.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResidencyToggle;
