import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import globeTravel from "@/assets/icons/globe-travel.jpg";
import passportStamps from "@/assets/icons/passport-stamps.jpg";
import studentGlobal from "@/assets/icons/student-global.jpg";

const QuickLinks = () => {
  const links = [
    {
      image: globeTravel,
      title: "All Countries",
      description: "Browse 200+ country visa guides with detailed requirements",
      link: "/countries",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      image: null,
      emoji: "🗺️",
      title: "Visa-Free Countries",
      description: "Find where you can travel without a visa based on your passport",
      link: "/visa-free-countries",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      image: null,
      emoji: "🏆",
      title: "Passport Rankings",
      description: "Global passport power index and mobility scores",
      link: "/passport-index",
      gradient: "from-amber-500/20 to-orange-500/20",
    },
    {
      image: passportStamps,
      title: "Tourist Visa",
      description: "Tourism & leisure travel visa requirements worldwide",
      link: "/visa-types/tourist-visa",
      gradient: "from-rose-500/20 to-pink-500/20",
    },
    {
      image: null,
      emoji: "💼",
      title: "Business Visa",
      description: "Business travel and work permit requirements",
      link: "/visa-types/business-visa",
      gradient: "from-purple-500/20 to-violet-500/20",
    },
    {
      image: studentGlobal,
      title: "Student Visa",
      description: "Study abroad visa requirements for international students",
      link: "/visa-types/student-visa",
      gradient: "from-indigo-500/20 to-blue-500/20",
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Quick Access
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Jump directly to the visa information you need
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {links.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${item.gradient} p-1 hover:shadow-xl transition-all duration-300`}
          >
            <div className="bg-card rounded-xl p-5 h-full flex items-start gap-4">
              {/* Image or Emoji */}
              <div className="flex-shrink-0">
                {item.image ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                    {item.emoji}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                  {item.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickLinks;
