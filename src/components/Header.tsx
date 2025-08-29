import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <h1 className="text-xl font-bold text-primary">Visas.Guide</h1>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#destinations" className="text-foreground hover:text-primary transition-colors">
              Destinations
            </a>
            <a href="#visa-types" className="text-foreground hover:text-primary transition-colors">
              Visa Types
            </a>
            <a href="#guides" className="text-foreground hover:text-primary transition-colors">
              Guides
            </a>
            <a href="#requirements" className="text-foreground hover:text-primary transition-colors">
              Requirements
            </a>
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2 bg-muted rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search country or visa type..."
                className="border-0 bg-transparent p-0 focus-visible:ring-0 w-48"
              />
            </div>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;