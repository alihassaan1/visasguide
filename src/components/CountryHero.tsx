import { countryCodeToFlagEmoji } from "@/lib/utils";
import { Award, Globe2, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getCountryHeroImage } from "@/lib/country-hero-images";
const defaultHeroImage = getCountryHeroImage("");

const formatNumber = (n?: number | null) => {
  if (!n) return null;
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
};

interface CountryHeroProps {
  country: {
    name: string;
    slug: string;
    code: string;
    flag_emoji?: string | null;
    continent?: string | null;
    region?: string | null;
    capital?: string | null;
    passport_rank?: number | null;
    tourism_rank?: number | null;
    annual_tourists?: number | null;
  };
  visaFreeCount?: number;
}

const CountryHero = ({ country, visaFreeCount }: CountryHeroProps) => {
  const heroImage = getCountryHeroImage(country.slug);
  const flagEmoji = country.flag_emoji || countryCodeToFlagEmoji(country.code) || "🏳️";
  const tourists = formatNumber(country.annual_tourists);

  return (
    <section className="relative w-full rounded-2xl overflow-hidden mb-6 min-h-[420px] sm:min-h-[420px] flex flex-col justify-end">
      {/* Background Image */}
      <img
        src={heroImage}
        alt={`${country.name} landscape`}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        onError={(e) => {
          (e.target as HTMLImageElement).src = defaultHeroImage;
        }}
      />

      {/* Stronger overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

      {/* Region tag — top left */}
      {(country.region || country.continent) && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20">
            <Globe2 className="h-3 w-3" />
            {country.region || country.continent}
          </span>
        </div>
      )}

      {/* Bottom content stack */}
      <div className="relative z-10 p-4 sm:p-7 md:p-9 space-y-4 sm:space-y-5">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5">
          <span
            className="text-5xl sm:text-6xl md:text-7xl drop-shadow-2xl leading-none"
            style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}
          >
            {flagEmoji}
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight break-words">
              {country.name}
            </h1>
            <p className="text-sm sm:text-base text-white/85 mt-1">
              Complete visa requirements & travel guide for 2026
            </p>
          </div>
        </div>

        {/* Stats strip — translucent glass cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {country.passport_rank && (
            <HeroStat icon={Award} label="Passport Rank" value={`#${country.passport_rank}`} />
          )}
          {visaFreeCount !== undefined && visaFreeCount > 0 && (
            <HeroStat icon={Globe2} label="Visa-Free Access" value={`${visaFreeCount}`} accent />
          )}
          {country.capital && (
            <HeroStat icon={MapPin} label="Capital" value={country.capital} />
          )}
          {tourists && (
            <HeroStat icon={Users} label="Annual Tourists" value={tourists} />
          )}
        </div>

        {/* Primary CTA — scroll to passport selector */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center pt-1">
          <Button
            asChild
            size="lg"
            className="bg-white text-foreground hover:bg-white/90 shadow-lg font-semibold"
          >
            <a href="#check-visa">
              Do I need a visa for {country.name}?
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
          <p className="text-xs sm:text-sm text-white/75">
            Select your passport — get answers in seconds.
          </p>
        </div>
      </div>
    </section>
  );
};

const HeroStat = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="bg-white/12 backdrop-blur-md rounded-xl border border-white/15 px-3 py-2.5 sm:px-4 sm:py-3">
    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-wider text-white/70 mb-1">
      <Icon className="h-3 w-3" />
      {label}
    </div>
    <div className={`text-lg sm:text-xl md:text-2xl font-bold truncate ${accent ? "text-emerald-300" : "text-white"}`}>
      {value}
    </div>
  </div>
);

export default CountryHero;
