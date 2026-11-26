import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Settings,
  LogOut,
  Search,
  ExternalLink,
  Bell,
  ChevronRight,
} from "lucide-react";
import { MobileSidebar } from "./AdminSidebar";

// Map segment slugs to human-readable labels
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  analytics: "Analytics",
  seo: "SEO Health",
  content: "Content",
  authors: "Authors",
  agent: "Content Agent",
  marketing: "Marketing",
  social: "Social Dashboard",
  posts: "Social Posts",
  newsletter: "Newsletter",
  monetization: "Ads & Monetization",
  "ad-performance": "Ad Performance",
  "banner-debug": "Banner Debug",
  users: "Users",
  freelancers: "Freelancers",
  data: "Data Manager",
  "data-import": "Data Import",
  settings: "Site Settings",
  "api-settings": "API Keys",
};

const labelize = (slug: string) =>
  SEGMENT_LABELS[slug] ||
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserEmail(session.user.email || "");
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      if (role) setUserRole(role.role);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
  };

  const getInitials = (email: string) => email.substring(0, 2).toUpperCase() || "AD";

  const crumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments.map((seg, i) => ({
      label: labelize(seg),
      href: "/" + segments.slice(0, i + 1).join("/"),
      isLast: i === segments.length - 1,
    }));
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <MobileSidebar />

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 items-center gap-1 text-sm sm:flex">
          {crumbs.map((c, i) => (
            <div key={c.href} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
              {c.isLast ? (
                <span className="truncate font-medium text-foreground">{c.label}</span>
              ) : (
                <Link
                  to={c.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile title */}
        <h1 className="min-w-0 flex-1 truncate text-base font-semibold sm:hidden">
          {crumbs[crumbs.length - 1]?.label || "Admin"}
        </h1>

        {/* Search (decorative for now) */}
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            className="h-8 w-56 rounded-md border-border/60 bg-muted/40 pl-8 pr-12 text-[13px] placeholder:text-muted-foreground/70 focus-visible:ring-1"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded-sm border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground xl:inline-flex">
            ⌘K
          </kbd>
        </div>

        <Badge
          variant="outline"
          className="hidden h-6 gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 md:inline-flex"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hidden h-8 gap-1.5 text-[13px] text-muted-foreground hover:text-foreground md:inline-flex"
        >
          <a href="/" target="_blank" rel="noopener noreferrer">
            View site
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-1.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                  {getInitials(userEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight xl:block">
                <p className="max-w-[140px] truncate text-[12px] font-medium">{userEmail}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {userRole || "member"}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 w-56 border bg-card">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{userEmail || "Admin"}</p>
                <p className="text-xs capitalize text-muted-foreground">{userRole}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/users")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
