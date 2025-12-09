import { Link } from "react-router-dom";
import { Globe, FileText, MapPin, Plane, Users, Shield } from "lucide-react";

const QuickLinks = () => {
  const links = [
    {
      icon: Globe,
      title: "All Countries",
      description: "Browse 200+ country visa guides",
      link: "/countries",
    },
    {
      icon: MapPin,
      title: "Visa-Free Countries",
      description: "Find where you can travel without a visa",
      link: "/visa-free-countries",
    },
    {
      icon: Shield,
      title: "Passport Rankings",
      description: "Global passport power index",
      link: "/passport-rankings",
    },
    {
      icon: FileText,
      title: "Tourist Visa",
      description: "Tourism & leisure travel visas",
      link: "/visa-types/tourist",
    },
    {
      icon: Users,
      title: "Business Visa",
      description: "Business & work travel visas",
      link: "/visa-types/business",
    },
    {
      icon: Plane,
      title: "Student Visa",
      description: "Study abroad visa requirements",
      link: "/visa-types/student",
    },
  ];

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Quick Access</h2>
        <p className="text-muted-foreground">Find the visa information you need</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {links.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 text-center"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickLinks;
