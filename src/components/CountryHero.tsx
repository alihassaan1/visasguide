import { countryCodeToFlagEmoji } from "@/lib/utils";
import { Award, Globe2, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import local destination images
import angolaImg from "@/assets/destinations/angola.jpg";
import polandImg from "@/assets/destinations/poland.jpg";
import hungaryImg from "@/assets/destinations/hungary.jpg";
import slovakiaImg from "@/assets/destinations/slovakia.jpg";
import lithuaniaImg from "@/assets/destinations/lithuania.jpg";
import sloveniaImg from "@/assets/destinations/slovenia.jpg";
import southKoreaImg from "@/assets/destinations/south-korea.jpg";
import icelandImg from "@/assets/destinations/iceland.jpg";
import southSudanImg from "@/assets/destinations/south-sudan.jpg";
import ivoryCoastImg from "@/assets/destinations/ivory-coast.jpg";
import japanImg from "@/assets/destinations/japan.jpg";
import canadaImg from "@/assets/destinations/canada.jpg";
import pakistanImg from "@/assets/destinations/pakistan.jpg";

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600&h=700&fit=crop&q=80`;

// Country hero images mapping — comprehensive coverage
const countryHeroImages: Record<string, string> = {
  "angola": angolaImg, "poland": polandImg, "hungary": hungaryImg, "slovakia": slovakiaImg,
  "lithuania": lithuaniaImg, "slovenia": sloveniaImg, "south-korea": southKoreaImg,
  "korea-south": southKoreaImg, "iceland": icelandImg, "south-sudan": southSudanImg,
  "ivory-coast": ivoryCoastImg, "cote-d-ivoire": ivoryCoastImg, "japan": japanImg,
  "canada": canadaImg, "pakistan": pakistanImg,
  "afghanistan": u("1565016004284-e9f4818e37aa"), "albania": u("1555990793-5c79fe1a1f44"),
  "algeria": u("1571722861498-46157c09c9d9"), "andorra": u("1570107263924-41d2cbf8f59e"),
  "antigua-and-barbuda": u("1580237072617-a60a52071089"), "argentina": u("1589909202802-8f4aadce1849"),
  "armenia": u("1559127452-0e8e1f63aee4"), "australia": u("1523482580672-f109ba8cb9be"),
  "austria": u("1516550893923-42d28e5677af"), "azerbaijan": u("1596627116790-af6f46dddb76"),
  "bahamas": u("1548574505023-7298a1245e40"), "bahrain": u("1596374923764-79ac48f6f1b0"),
  "bangladesh": u("1596186243107-d23e2d14bf01"), "barbados": u("1578922613715-80c4c4f4f32a"),
  "belarus": u("1566986990908-fd3e4b8c3a0f"), "belgium": u("1491557345352-5929e343eb89"),
  "belize": u("1580237072617-a60a52071089"), "benin": u("1578922613715-80c4c4f4f32a"),
  "bhutan": u("1553856622-d1b352e24dc4"), "bolivia": u("1541410702738-f0ce30fce1fc"),
  "bosnia-and-herzegovina": u("1555990793-5c79fe1a1f44"), "botswana": u("1516426122078-c23e76319801"),
  "brazil": u("1483729558449-99ef09a8c325"), "brunei": u("1596374923764-79ac48f6f1b0"),
  "bulgaria": u("1570939274717-7eda259b50ed"), "burkina-faso": u("1578922613715-80c4c4f4f32a"),
  "burundi": u("1516426122078-c23e76319801"), "cambodia": u("1528127269322-539152af5929"),
  "cameroon": u("1516426122078-c23e76319801"), "cape-verde": u("1580237072617-a60a52071089"),
  "central-african-republic": u("1516426122078-c23e76319801"), "chad": u("1516426122078-c23e76319801"),
  "chile": u("1478827536114-da961b7f86d2"), "china": u("1508804185872-d7badad00f7d"),
  "colombia": u("1533757812935-b67f7f1e58df"), "comoros": u("1580237072617-a60a52071089"),
  "congo": u("1516426122078-c23e76319801"), "democratic-republic-of-the-congo": u("1516426122078-c23e76319801"),
  "costa-rica": u("1519999482648-25049ddd37b1"), "croatia": u("1555990538-1e74b3ab7505"),
  "cuba": u("1570299437643-e2b15ef23cb6"), "cyprus": u("1562002554-0914fbabf76b"),
  "czech-republic": u("1541849546-216549ae216d"), "czechia": u("1541849546-216549ae216d"),
  "denmark": u("1513622470522-26c3c8a854bc"), "djibouti": u("1516426122078-c23e76319801"),
  "dominica": u("1580237072617-a60a52071089"), "dominican-republic": u("1580237072617-a60a52071089"),
  "ecuador": u("1541410702738-f0ce30fce1fc"), "egypt": u("1503177119275-0aa32b3a9368"),
  "el-salvador": u("1518105779142-d975f22f1b0a"), "equatorial-guinea": u("1516426122078-c23e76319801"),
  "eritrea": u("1516426122078-c23e76319801"), "estonia": u("1561542320-9a18cd340469"),
  "eswatini": u("1516426122078-c23e76319801"), "ethiopia": u("1516426122078-c23e76319801"),
  "fiji": u("1580237072617-a60a52071089"), "finland": u("1538332576228-eb5b4c4de6f5"),
  "france": u("1502602898657-3e91760cbb34"), "gabon": u("1516426122078-c23e76319801"),
  "gambia": u("1516426122078-c23e76319801"), "georgia": u("1565008576549-57569a49371d"),
  "germany": u("1467269204594-9661b134dd2b"), "ghana": u("1578922613715-80c4c4f4f32a"),
  "greece": u("1533105079780-92b9be482077"), "grenada": u("1580237072617-a60a52071089"),
  "guatemala": u("1518105779142-d975f22f1b0a"), "guinea": u("1516426122078-c23e76319801"),
  "guinea-bissau": u("1516426122078-c23e76319801"), "guyana": u("1541410702738-f0ce30fce1fc"),
  "haiti": u("1580237072617-a60a52071089"), "honduras": u("1518105779142-d975f22f1b0a"),
  "india": u("1524492412937-b28074a5d7da"), "indonesia": u("1537996194471-e657df975ab4"),
  "iran": u("1565008576549-57569a49371d"), "iraq": u("1565008576549-57569a49371d"),
  "ireland": u("1590089415225-401ed6f9db8e"), "israel": u("1544967082-d9d25d867d66"),
  "italy": u("1515542622106-78bda8ba0e5b"), "jamaica": u("1580237072617-a60a52071089"),
  "jordan": u("1548786811-dd6e453ccca7"), "kazakhstan": u("1565008576549-57569a49371d"),
  "kenya": u("1489392191049-fc10c97e64b6"), "kiribati": u("1580237072617-a60a52071089"),
  "kuwait": u("1596374923764-79ac48f6f1b0"), "kyrgyzstan": u("1565008576549-57569a49371d"),
  "laos": u("1528127269322-539152af5929"), "latvia": u("1561542320-9a18cd340469"),
  "lebanon": u("1565008576549-57569a49371d"), "lesotho": u("1516426122078-c23e76319801"),
  "liberia": u("1516426122078-c23e76319801"), "libya": u("1516426122078-c23e76319801"),
  "liechtenstein": u("1530122037265-a5f1f91d3b99"), "luxembourg": u("1491557345352-5929e343eb89"),
  "madagascar": u("1516426122078-c23e76319801"), "malawi": u("1516426122078-c23e76319801"),
  "malaysia": u("1508062878650-88b52897f298"), "maldives": u("1514282401047-d79a71a590e8"),
  "mali": u("1516426122078-c23e76319801"), "malta": u("1562002554-0914fbabf76b"),
  "marshall-islands": u("1580237072617-a60a52071089"), "mauritania": u("1516426122078-c23e76319801"),
  "mauritius": u("1580237072617-a60a52071089"), "mexico": u("1518105779142-d975f22f1b0a"),
  "micronesia": u("1580237072617-a60a52071089"), "moldova": u("1561542320-9a18cd340469"),
  "monaco": u("1530122037265-a5f1f91d3b99"), "mongolia": u("1565008576549-57569a49371d"),
  "montenegro": u("1555990793-5c79fe1a1f44"), "morocco": u("1489749798305-4fea3ae63d43"),
  "mozambique": u("1516426122078-c23e76319801"), "myanmar": u("1528127269322-539152af5929"),
  "namibia": u("1516426122078-c23e76319801"), "nauru": u("1580237072617-a60a52071089"),
  "nepal": u("1544735716-392fe2489ffa"), "netherlands": u("1534351590666-13e3e96b5017"),
  "new-zealand": u("1469521669194-babb45599def"), "nicaragua": u("1518105779142-d975f22f1b0a"),
  "niger": u("1516426122078-c23e76319801"), "nigeria": u("1578922613715-80c4c4f4f32a"),
  "north-korea": u("1565008576549-57569a49371d"), "north-macedonia": u("1555990793-5c79fe1a1f44"),
  "norway": u("1531366936337-7c912a4589a7"), "oman": u("1596374923764-79ac48f6f1b0"),
  "palau": u("1580237072617-a60a52071089"), "palestine": u("1565008576549-57569a49371d"),
  "panama": u("1519999482648-25049ddd37b1"), "papua-new-guinea": u("1580237072617-a60a52071089"),
  "paraguay": u("1541410702738-f0ce30fce1fc"), "peru": u("1526392060635-9d6019884377"),
  "philippines": u("1518548419970-58e3b4079ab2"), "portugal": u("1555881400-74d7acaacd8b"),
  "qatar": u("1559304822-9eb2813c9844"), "romania": u("1584646098378-0874589d76b1"),
  "russia": u("1513326738677-b964603b136d"), "rwanda": u("1516426122078-c23e76319801"),
  "saint-kitts-and-nevis": u("1580237072617-a60a52071089"), "saint-lucia": u("1580237072617-a60a52071089"),
  "saint-vincent-and-the-grenadines": u("1580237072617-a60a52071089"), "samoa": u("1580237072617-a60a52071089"),
  "san-marino": u("1515542622106-78bda8ba0e5b"), "sao-tome-and-principe": u("1580237072617-a60a52071089"),
  "saudi-arabia": u("1586724237569-f3d0c1dee8c6"), "senegal": u("1578922613715-80c4c4f4f32a"),
  "serbia": u("1555990793-5c79fe1a1f44"), "seychelles": u("1580237072617-a60a52071089"),
  "sierra-leone": u("1516426122078-c23e76319801"), "singapore": u("1525625293386-3f8f99389edd"),
  "solomon-islands": u("1580237072617-a60a52071089"), "somalia": u("1516426122078-c23e76319801"),
  "south-africa": u("1580060839134-75a5edca2e99"), "spain": u("1539037116277-4db20889f2d4"),
  "sri-lanka": u("1528127269322-539152af5929"), "sudan": u("1516426122078-c23e76319801"),
  "suriname": u("1541410702738-f0ce30fce1fc"), "sweden": u("1509356843151-3e7d96241e11"),
  "switzerland": u("1530122037265-a5f1f91d3b99"), "syria": u("1565008576549-57569a49371d"),
  "taiwan": u("1528127269322-539152af5929"), "tajikistan": u("1565008576549-57569a49371d"),
  "tanzania": u("1489392191049-fc10c97e64b6"), "thailand": u("1528181304800-259b08848526"),
  "timor-leste": u("1528127269322-539152af5929"), "togo": u("1516426122078-c23e76319801"),
  "tonga": u("1580237072617-a60a52071089"), "trinidad-and-tobago": u("1580237072617-a60a52071089"),
  "tunisia": u("1489749798305-4fea3ae63d43"), "turkey": u("1541432901042-2d8bd64b4a9b"),
  "turkmenistan": u("1565008576549-57569a49371d"), "tuvalu": u("1580237072617-a60a52071089"),
  "uganda": u("1489392191049-fc10c97e64b6"), "ukraine": u("1561542320-9a18cd340469"),
  "united-arab-emirates": u("1518684079-3c830dcef090"), "united-kingdom": u("1513635269975-59663e0ac1ad"),
  "united-states": u("1485738422979-f5c462d49f74"), "uruguay": u("1541410702738-f0ce30fce1fc"),
  "uzbekistan": u("1565008576549-57569a49371d"), "vanuatu": u("1580237072617-a60a52071089"),
  "vatican-city": u("1515542622106-78bda8ba0e5b"), "venezuela": u("1541410702738-f0ce30fce1fc"),
  "vietnam": u("1557750255-c76072a7aad1"), "yemen": u("1565008576549-57569a49371d"),
  "zambia": u("1516426122078-c23e76319801"), "zimbabwe": u("1516426122078-c23e76319801"),
};

const defaultHeroImage = u("1488646953014-85cb44e25828");

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
  const heroImage = countryHeroImages[country.slug] || defaultHeroImage;
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
