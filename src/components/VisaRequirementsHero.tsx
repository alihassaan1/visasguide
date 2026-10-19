import { countryCodeToFlagEmoji } from "@/lib/utils";

// Import local destination images
const angolaImg = "https://cdn.visas.guide/assets/destinations/angola.jpg";
const polandImg = "https://cdn.visas.guide/assets/destinations/poland.jpg";
const hungaryImg = "https://cdn.visas.guide/assets/destinations/hungary.jpg";
const slovakiaImg = "https://cdn.visas.guide/assets/destinations/slovakia.jpg";
const lithuaniaImg = "https://cdn.visas.guide/assets/destinations/lithuania.jpg";
const sloveniaImg = "https://cdn.visas.guide/assets/destinations/slovenia.jpg";
const southKoreaImg = "https://cdn.visas.guide/assets/destinations/south-korea.jpg";
const icelandImg = "https://cdn.visas.guide/assets/destinations/iceland.jpg";
const southSudanImg = "https://cdn.visas.guide/assets/destinations/south-sudan.jpg";
const ivoryCoastImg = "https://cdn.visas.guide/assets/destinations/ivory-coast.jpg";
const japanImg = "https://cdn.visas.guide/assets/destinations/japan.jpg";
const canadaImg = "https://cdn.visas.guide/assets/destinations/canada.jpg";
const pakistanImg = "https://cdn.visas.guide/assets/destinations/pakistan.jpg";
const franceImg = "https://cdn.visas.guide/assets/destinations/france.jpg";
const uaeImg = "https://cdn.visas.guide/assets/destinations/uae.jpg";
const thailandImg = "https://cdn.visas.guide/assets/destinations/thailand.jpg";
const singaporeImg = "https://cdn.visas.guide/assets/destinations/singapore.jpg";
const indonesiaImg = "https://cdn.visas.guide/assets/destinations/indonesia.jpg";
const malaysiaImg = "https://cdn.visas.guide/assets/destinations/malaysia.jpg";

// Country hero images mapping
const countryHeroImages: Record<string, string> = {
  "angola": angolaImg,
  "poland": polandImg,
  "hungary": hungaryImg,
  "slovakia": slovakiaImg,
  "lithuania": lithuaniaImg,
  "slovenia": sloveniaImg,
  "south-korea": southKoreaImg,
  "korea-south": southKoreaImg,
  "iceland": icelandImg,
  "south-sudan": southSudanImg,
  "ivory-coast": ivoryCoastImg,
  "cote-d-ivoire": ivoryCoastImg,
  "japan": japanImg,
  "canada": canadaImg,
  "pakistan": pakistanImg,
  "france": franceImg,
  "uae": uaeImg,
  "united-arab-emirates": uaeImg,
  "thailand": thailandImg,
  "singapore": singaporeImg,
  "indonesia": indonesiaImg,
  "malaysia": malaysiaImg,
  // Reliable Unsplash URLs for other destinations
  "united-states": "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&h=400&fit=crop&q=80",
  "united-kingdom": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=400&fit=crop&q=80",
  "germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&h=400&fit=crop&q=80",
  "australia": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&h=400&fit=crop&q=80",
  "italy": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&h=400&fit=crop&q=80",
  "spain": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=400&fit=crop&q=80",
  "india": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=400&fit=crop&q=80",
  "china": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&h=400&fit=crop&q=80",
  "brazil": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=400&fit=crop&q=80",
  "mexico": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&h=400&fit=crop&q=80",
  "netherlands": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&h=400&fit=crop&q=80",
  "switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&h=400&fit=crop&q=80",
  "portugal": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&h=400&fit=crop&q=80",
  "greece": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=400&fit=crop&q=80",
  "turkey": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&h=400&fit=crop&q=80",
  "egypt": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&h=400&fit=crop&q=80",
  "south-africa": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&h=400&fit=crop&q=80",
  "new-zealand": "https://images.unsplash.com/photo-1469521669194-babb45599def?w=1200&h=400&fit=crop&q=80",
  "russia": "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=400&fit=crop&q=80",
  "austria": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&h=400&fit=crop&q=80",
  "belgium": "https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1200&h=400&fit=crop&q=80",
  "ireland": "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=1200&h=400&fit=crop&q=80",
  "sweden": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&h=400&fit=crop&q=80",
  "norway": "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&h=400&fit=crop&q=80",
  "denmark": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=400&fit=crop&q=80",
  "finland": "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=1200&h=400&fit=crop&q=80",
  "czech-republic": "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&h=400&fit=crop&q=80",
  "vietnam": "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=1200&h=400&fit=crop&q=80",
  "philippines": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&h=400&fit=crop&q=80",
  "morocco": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&h=400&fit=crop&q=80",
  "kenya": "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200&h=400&fit=crop&q=80",
  "argentina": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&h=400&fit=crop&q=80",
  "chile": "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1200&h=400&fit=crop&q=80",
  "peru": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&h=400&fit=crop&q=80",
  "colombia": "https://images.unsplash.com/photo-1533757812935-b67f7f1e58df?w=1200&h=400&fit=crop&q=80",
  "saudi-arabia": "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&h=400&fit=crop&q=80",
  "qatar": "https://images.unsplash.com/photo-1559304822-9eb2813c9844?w=1200&h=400&fit=crop&q=80",
  "israel": "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&h=400&fit=crop&q=80",
  "jordan": "https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=1200&h=400&fit=crop&q=80",
  "croatia": "https://images.unsplash.com/photo-1555990538-1e74b3ab7505?w=1200&h=400&fit=crop&q=80",
  "romania": "https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=1200&h=400&fit=crop&q=80",
  "bulgaria": "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=1200&h=400&fit=crop&q=80",
  "ukraine": "https://images.unsplash.com/photo-1561542320-9a18cd340469?w=1200&h=400&fit=crop&q=80",
};

// Default hero image for countries without specific images
const defaultHeroImage = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop&q=80";

interface VisaRequirementsHeroProps {
  fromCountry: {
    name: string;
    slug: string;
    code: string;
    flag_emoji?: string | null;
  };
  toCountry: {
    name: string;
    slug: string;
    code: string;
    flag_emoji?: string | null;
    continent?: string | null;
    region?: string | null;
  };
  featuredImage?: string | null;
}

const VisaRequirementsHero = ({ fromCountry, toCountry, featuredImage }: VisaRequirementsHeroProps) => {
  const heroImage = featuredImage || countryHeroImages[toCountry.slug] || defaultHeroImage;
  const fromFlag = fromCountry.flag_emoji || countryCodeToFlagEmoji(fromCountry.code) || '🏳️';
  const toFlag = toCountry.flag_emoji || countryCodeToFlagEmoji(toCountry.code) || '🏳️';

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden mb-6">
      {/* Background Image */}
      <img
        src={heroImage}
        alt={`${toCountry.name} destination`}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        onError={(e) => {
          (e.target as HTMLImageElement).src = defaultHeroImage;
        }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-3">
          {/* Route Flags */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span 
              className="text-3xl sm:text-4xl md:text-5xl drop-shadow-lg" 
              style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}
            >
              {fromFlag}
            </span>
            <span className="text-white/80 text-xl sm:text-2xl font-light">→</span>
            <span 
              className="text-3xl sm:text-4xl md:text-5xl drop-shadow-lg" 
              style={{ fontFamily: "'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}
            >
              {toFlag}
            </span>
          </div>
          
          {/* Title */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              {toCountry.name} Visa for {fromCountry.name} Citizens
            </h1>
            <p className="text-sm sm:text-base text-white/80 mt-1">
              {toCountry.region || toCountry.continent || 'International'} • Complete Visa Requirements Guide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaRequirementsHero;
