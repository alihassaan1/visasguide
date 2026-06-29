import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Sparkles,
  Database,
  Key,
  TrendingUp,
  Download,
  Menu as MenuIcon,
  Activity,
  Bot,
  Code,
  FileCode,
  ScrollText,
  ChevronRight,
  Megaphone,
  Mail,
  DollarSign,
  Globe,
  ClipboardList,
  Ticket,
  X,
  BarChart3,
  Bell,
  Image as ImageIcon,
} from "lucide-react";

interface MenuItem {
  title: string;
  icon: any;
  href: string;
}

interface MenuGroup {
  title: string;
  icon: any;
  children: MenuItem[];
}

type MenuItemOrGroup = MenuItem | MenuGroup;

const isMenuGroup = (item: MenuItemOrGroup): item is MenuGroup => {
  return "children" in item;
};

const menuStructure: MenuItemOrGroup[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  {
    title: "Analytics",
    icon: TrendingUp,
    children: [
      { title: "Overview", icon: TrendingUp, href: "/admin/analytics" },
      { title: "SEO Health", icon: Globe, href: "/admin/seo" },
    ],
  },
  {
    title: "Content",
    icon: FileText,
    children: [
      { title: "All Pages", icon: FileText, href: "/admin/content" },
      { title: "Create New", icon: Sparkles, href: "/admin/ai-content-studio" },
      { title: "Image Generator", icon: ImageIcon, href: "/admin/image-generator" },
      { title: "Authors", icon: Users, href: "/admin/authors" },
      { title: "Policy Tracker", icon: Bell, href: "/admin/policy-tracker" },
      { title: "RSS Feeds Health", icon: Activity, href: "/admin/rss-health" },
      { title: "Content Validator", icon: Activity, href: "/admin/content-validator" },
    ],
  },
  {
    title: "AI Agent",
    icon: Bot,
    children: [
      { title: "Content Agent", icon: Bot, href: "/admin/agent" },
      { title: "Agent Logs", icon: ScrollText, href: "/admin/content-agent-logs" },
    ],
  },
  {
    title: "Social Media",
    icon: Megaphone,
    children: [
      { title: "Social Dashboard", icon: Activity, href: "/admin/marketing/social" },
      { title: "Social Posts", icon: Megaphone, href: "/admin/marketing/posts" },
    ],
  },
  {
    title: "Marketing",
    icon: Mail,
    children: [
      { title: "Newsletter", icon: Mail, href: "/admin/newsletter" },
      { title: "Affiliate Manager", icon: Ticket, href: "/admin/affiliate-manager" },
      { title: "Ads & Affiliates", icon: DollarSign, href: "/admin/monetization" },
      { title: "Ad Performance", icon: BarChart3, href: "/admin/ad-performance" },
    ],
  },
  {
    title: "Users",
    icon: Users,
    children: [
      { title: "User Management", icon: Users, href: "/admin/users" },
      { title: "Freelancers", icon: ClipboardList, href: "/admin/freelancers" },
    ],
  },
  {
    title: "Data",
    icon: Database,
    children: [
      { title: "Data Manager", icon: Database, href: "/admin/data" },
      { title: "Data Import", icon: Download, href: "/admin/data-import" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "Site Settings", icon: Settings, href: "/admin/settings" },
      { title: "API Keys", icon: Key, href: "/admin/api-settings" },
    ],
  },
];

const adminOnlyItems: MenuItem[] = [
  { title: "Developer Agent", icon: Code, href: "/admin/developer-agent" },
  { title: "Developer Settings", icon: FileCode, href: "/admin/developer-settings" },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    checkAdminRole();
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    menuStructure.forEach((item) => {
      if (isMenuGroup(item)) {
        const hasActiveChild = item.children.some((child) => currentPath === child.href);
        if (hasActiveChild && !openGroups.includes(item.title)) {
          setOpenGroups((prev) => [...prev, item.title]);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const checkAdminRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");
    setIsAdmin(roles && roles.length > 0);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActiveRoute = (href: string) => location.pathname === href;
  const isGroupActive = (group: MenuGroup) =>
    group.children.some((child) => location.pathname === child.href);

  const handleLinkClick = () => onClose?.();

  const renderTopItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={handleLinkClick}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-primary transition-opacity",
            isActive ? "opacity-100" : "opacity-0"
          )}
        />
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.title}</span>
      </Link>
    );
  };

  const renderChildItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={handleLinkClick}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-md py-1.5 pl-9 pr-2.5 text-[13px] transition-colors",
          isActive
            ? "bg-primary/10 font-medium text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-primary transition-opacity",
            isActive ? "opacity-100" : "opacity-0"
          )}
        />
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
        <span className="truncate">{item.title}</span>
      </Link>
    );
  };

  const renderMenuGroup = (group: MenuGroup) => {
    const Icon = group.icon;
    const isOpen = openGroups.includes(group.title);
    const hasActiveChild = isGroupActive(group);

    return (
      <Collapsible key={group.title} open={isOpen} onOpenChange={() => toggleGroup(group.title)}>
        <CollapsibleTrigger
          className={cn(
            "group flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
            hasActiveChild
              ? "text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Icon className="h-4 w-4" />
            <span className="truncate">{group.title}</span>
          </div>
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-0.5 space-y-0.5">
          {group.children.map(renderChildItem)}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
            <Globe className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">visas.guide</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Admin Console
            </p>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 md:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1">
        <nav className="space-y-0.5 px-3 py-4">
          <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Workspace
          </p>
          {menuStructure.map((item) =>
            isMenuGroup(item) ? renderMenuGroup(item) : renderTopItem(item)
          )}

          {isAdmin && (
            <div className="pt-4">
              <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Developer
              </p>
              <div className="space-y-0.5">{adminOnlyItems.map(renderTopItem)}</div>
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t px-4 py-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems normal
          </span>
          <span>v2026.5</span>
        </div>
      </div>
    </div>
  );

  if (onClose) return sidebarContent;

  return (
    <aside className="hidden h-screen w-60 shrink-0 border-r bg-card md:sticky md:top-0 md:block">
      {sidebarContent}
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-card p-0">
        <AdminSidebar onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
