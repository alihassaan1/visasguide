import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { countryCodeToFlagEmoji } from "@/lib/utils"

interface Country {
  id: string
  name: string
  code: string
  flag_emoji?: string
  slug: string
}

interface CountryComboboxProps {
  countries: Country[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
}

export function CountryCombobox({
  countries,
  value,
  onValueChange,
  placeholder = "Select country...",
  label
}: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedCountry = countries.find((country) => country.id === value)

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs text-muted-foreground block">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCountry ? (
              <span className="flex items-center gap-2">
                <span style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                  {selectedCountry.flag_emoji || countryCodeToFlagEmoji(selectedCountry.code) || '🏳️'}
                </span>
                <span>{selectedCountry.name}</span>
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.id}
                    value={country.name}
                    onSelect={() => {
                      onValueChange(country.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === country.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex items-center gap-2">
                      <span style={{ fontFamily: "'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', 'Apple Color Emoji', sans-serif" }}>
                        {country.flag_emoji || countryCodeToFlagEmoji(country.code) || '🏳️'}
                      </span>
                      <span>{country.name}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
