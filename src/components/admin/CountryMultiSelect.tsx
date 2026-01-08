import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CountryMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function CountryMultiSelect({
  value,
  onChange,
  placeholder = "Select countries...",
}: CountryMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const { data: countries = [] } = useQuery({
    queryKey: ["countries-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("code, name, flag_emoji")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const selectedCountries = countries.filter((c) => value.includes(c.code));

  const handleSelect = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((v) => v !== code));
    } else {
      onChange([...value, code]);
    }
  };

  const handleRemove = (code: string) => {
    onChange(value.filter((v) => v !== code));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length > 0
              ? `${value.length} countries selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search countries..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={() => handleSelect(country.code)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(country.code)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="mr-2">{country.flag_emoji}</span>
                    {country.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {country.code}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCountries.map((country) => (
            <Badge
              key={country.code}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {country.flag_emoji} {country.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleRemove(country.code)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
