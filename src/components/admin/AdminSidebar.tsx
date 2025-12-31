import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  return 'children' in item;
};

const menuStructure: MenuItemOrGroup[] = [
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
    title: "Content",
    icon: FileText,
    children: [
      { title: "All Pages", icon: FileText, href: "/admin/content" },
      { title: "Create New", icon: Sparkles, href: "/admin/ai-content-studio" },
    ],
  },
  {
    title: "AI Agent",
    icon: Bot,
    children: [
      { title: "Dashboard", icon: Bot, href: "/admin/agent-dashboard" },
      { title: "RSS Automation", icon: Activity, href: "/admin/rss-monitoring" },
      { title: "RSS Feeds", icon: ScrollText, href: "/admin/rss-feeds" },
      { title: "Agent Logs", icon: Activity, href: "/admin/content-agent-logs" },
      { title: "API Logs", icon: ScrollText, href: "/admin/api-logs" },
      { title: "Visa Updater", icon: ClipboardList, href: "/admin/visa-requirements-content-updater" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    children: [
      { title: "Social Dashboard", icon: Megaphone, href: "/admin/marketing/social" },
      { title: "Social Posts", icon: FileText, href: "/admin/marketing/posts" },
      { title: "Platform Settings", icon: Settings, href: "/admin/marketing/platforms" },
      { title: "Newsletter", icon: Mail, href: "/admin/newsletter" },
      { title: "Ads & Affiliates", icon: DollarSign, href: "/admin/monetization" },
      { title: "Affiliate Manager", icon: Ticket, href: "/admin/affiliate-manager" },
    ],
  },
  {
    title: "Users",
    icon: Users,
    children: [
      { title: "User Management", icon: Users, href: "/admin/users" },
      { title: "Authors", icon: Users, href: "/admin/authors" },
    ],
  },
  {
    title: "Data",
    icon: Database,
    children: [
      { title: "Data Manager", icon: Database, href: "/admin/data" },
      { title: "Visa Requirements", icon: ClipboardList, href: "/admin/visa-requirements" },
      { title: "Import Data", icon: Download, href: "/admin/data-import" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "Site Settings", icon: Settings, href: "/admin/settings" },
      { title: "API Keys", icon: Key, href: "/admin/api-settings" },
      { title: "Menu Manager", icon: MenuIcon, href: "/admin/menu" },
    ],
  },
];

const adminOnlyItems: MenuItem[] = [
  {
    title: "Developer Agent",
    icon: Code,
    href: "/admin/developer-agent",
  },
  {
    title: "Developer Settings",
    icon: FileCode,
    href: "/admin/developer-settings",
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    checkAdminRole();
  }, []);

  // Auto-expand group containing active route
  useEffect(() => {
    const currentPath = location.pathname;
    menuStructure.forEach((item) => {
      if (isMenuGroup(item)) {
        const hasActiveChild = item.children.some(child => currentPath === child.href);
        if (hasActiveChild && !openGroups.includes(item.title)) {
          setOpenGroups(prev => [...prev, item.title]);
        }
      }
    });
  }, [location.pathname]);

  const checkAdminRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin');

    setIsAdmin(roles && roles.length > 0);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActiveRoute = (href: string) => location.pathname === href;

  const isGroupActive = (group: MenuGroup) => {
    return group.children.some(child => location.pathname === child.href);
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.href);
    
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
  };

  const renderMenuGroup = (group: MenuGroup) => {
    const Icon = group.icon;
    const isOpen = openGroups.includes(group.title);
    const hasActiveChild = isGroupActive(group);

    return (
      <Collapsible
        key={group.title}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.title)}
      >
        <CollapsibleTrigger
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            hasActiveChild
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            {group.title}
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-90"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 mt-1 space-y-1">
          {group.children.map((child) => {
            const ChildIcon = child.icon;
            const isActive = isActiveRoute(child.href);
            
            return (
              <Link
                key={child.href}
                to={child.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <ChildIcon className="h-3.5 w-3.5" />
                {child.title}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Visas.Guide CMS</p>
      </div>

      <nav className="space-y-1">
        {menuStructure.map((item) => 
          isMenuGroup(item) ? renderMenuGroup(item) : renderMenuItem(item)
        )}

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <div className="pt-4 mt-4 border-t">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Admin Only
              </p>
              {adminOnlyItems.map(renderMenuItem)}
            </div>
          </>
        )}
      </nav>
    </div>
  );
}