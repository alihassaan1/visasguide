import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CountryCombobox } from "@/components/CountryCombobox";
import { Plane, X } from "lucide-react";

interface CountryOption {
  id: string;
  name: string;
  code: string;
  flag_emoji?: string | null;
  slug: string;
}

interface Props {
  countries: CountryOption[];
  destinationName: string;
  destinationSlug: string;
  selectedPassport: string;
  onSelectPassport: (id: string) => void;
}

const StickyVisaCheckBar = ({
  countries,
  destinationName,
  destinationSlug,
  selectedPassport,
  onSelectPassport,
}: Props) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const target = document.getElementById("check-visa");
      const scrolledPast = window.scrollY > 600;
      let outOfView = true;
      if (target) {
        const rect = target.getBoundingClientRect();
        outOfView = rect.bottom < 0 || rect.top > window.innerHeight;
      }
      setVisible(scrolledPast && outOfView);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCheck = () => {
    const from = countries.find((c) => c.id === selectedPassport);
    if (!from) return;
    navigate(`/visa-requirements/${from.slug}-to-${destinationSlug}-visa-requirements`);
  };

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg animate-in slide-in-from-bottom-4">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plane className="h-4 w-4" />
          </div>
          <div className="hidden md:block text-sm font-medium whitespace-nowrap">
            Visa for <span className="text-primary">{destinationName}</span>?
          </div>
          <div className="flex-1 min-w-0">
            <CountryCombobox
              countries={countries}
              value={selectedPassport}
              onValueChange={onSelectPassport}
              placeholder="Your passport country..."
            />
          </div>
          <Button onClick={handleCheck} disabled={!selectedPassport} size="sm" className="shrink-0">
            Check
          </Button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyVisaCheckBar;
