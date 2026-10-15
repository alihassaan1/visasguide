import { Button } from "@/components/ui/button";
import { Menu, Globe, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSiteSettings } from "@/hooks/useSharedData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MenuItem {
  label: string;
  url: string;
  order: number;
  children?: MenuItem[];
}

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: siteSettings } = useSiteSettings();

  const menuItems = useMemo<MenuItem[]>(() => {
    const etiasItem: MenuItem = {
      label: "ETIAS",
      url: "/etias",
      order: 2,
      children: [
        { label: "What is ETIAS", url: "/etias", order: 0 },
        { label: "Apply", url: "/etias/application", order: 1 },
        { label: "Countries", url: "/etias/countries", order: 2 },
        { label: "FAQ", url: "/etias/faq", order: 3 },
      ],
    };
    const stored = siteSettings?.menu_items;
    if (stored && Array.isArray(stored)) {
      const items = (stored as unknown as MenuItem[]).slice();
      if (!items.some((i) => i.url === '/etias')) items.push(etiasItem);
      return items.sort((a, b) => a.order - b.order);
    }
    if (!siteSettings) return [];
    return [
      { label: "Countries", url: "/countries", order: 0 },
      { label: "Visa Search", url: "/visa-search", order: 1 },
      etiasItem,
      { label: "Guides", url: "/guides", order: 3 },
      { label: "Blog", url: "/blog", order: 4 },
      { label: "Passport Index Rankings", url: "/passport-index", order: 5 }
    ];
  }, [siteSettings]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 shrink-0"
            aria-label="Visas.Guide - Home"
          >
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              visas<span className="text-primary">.guide</span>
            </span>
          </Link>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden xl:flex items-center justify-center flex-1 min-w-0" ref={dropdownRef}>
            <div className="flex items-center gap-4 2xl:gap-6">

              {menuItems.map((item) => {
                if (item.children && item.children.length > 0) {
                  const isOpen = openDropdown === item.url;
                  return (
                    <div
                      key={item.url}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.url)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap px-1 flex items-center gap-1"
                        onClick={() => navigate(item.url)}
                        aria-expanded={isOpen}
                      >
                        {item.label}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="absolute top-full left-0 mt-1 w-56 bg-background border rounded-lg shadow-lg z-50 py-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.url}
                              to={child.url}
                              className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link 
                    key={item.url}
                    to={item.url} 
                    className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap px-1"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-2 shrink-0">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="xl:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-1 mt-6">
                  {menuItems.map((item) => {
                    if (item.children && item.children.length > 0) {
                      const isOpen = openDropdown === item.url;
                      return (
                        <div key={item.url} className="flex flex-col">
                          <div className="flex items-center justify-between py-2">
                            <Link
                              to={item.url}
                              className="text-lg font-medium hover:text-primary transition-colors flex-1"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                            <button
                              type="button"
                              className="p-2 -mr-2 hover:text-primary"
                              onClick={() => setOpenDropdown(isOpen ? null : item.url)}
                              aria-expanded={isOpen}
                              aria-label={`Toggle ${item.label} submenu`}
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                          {isOpen && (
                            <div className="pl-4 flex flex-col space-y-1 border-l-2 border-muted ml-2">
                              {item.children.map((child) => (
                                <Link
                                  key={child.url}
                                  to={child.url}
                                  className="text-base text-muted-foreground hover:text-primary transition-colors py-1"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <Link 
                        key={item.url}
                        to={item.url} 
                        className="text-lg font-medium hover:text-primary transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;