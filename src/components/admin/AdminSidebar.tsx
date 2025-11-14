import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Settings,
  Users,
  DollarSign,
  Sparkles,
  Database,
  Key,
  Rss,
  TrendingUp,
  Globe,
  Download,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    href: "/admin/analytics",
  },
  {
    title: "Content Manager",
    icon: FileText,
    href: "/admin/content",
  },
  {
    title: "AI Content Studio",
    icon: Sparkles,
    href: "/admin/ai-content-studio",
  },
  {
    title: "Country Content Updater",
    icon: Globe,
    href: "/admin/country-content-updater",
  },
  {
    title: "Newsletter",
    icon: Newspaper,
    href: "/admin/newsletter",
  },
  {
    title: "User Management",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Monetization",
    icon: DollarSign,
    href: "/admin/monetization",
  },
  {
    title: "Data Manager",
    icon: Database,
    href: "/admin/data",
  },
  {
    title: "Visa Requirements",
    icon: Rss,
    href: "/admin/visa-requirements",
  },
  {
    title: "Import Visa Data",
    icon: Download,
    href: "/admin/data-import",
  },
  {
    title: "API Settings",
    icon: Key,
    href: "/admin/api-settings",
  },
  {
    title: "Site Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Visas.Guide CMS</p>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
