
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, Users, Settings, Palette, LayoutGrid } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12",
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-subtle" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">Funilicious</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLinks location={location} closeMenu={closeMenu} />
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/builder">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Construtor
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/design">
                <Palette className="mr-2 h-4 w-4" />
                Design
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/leads">
                <Users className="mr-2 h-4 w-4" />
                Leads
              </Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-background z-40 animate-fade-in">
            <nav className="flex flex-col items-center justify-center p-8 h-full">
              <div className="flex flex-col items-center space-y-8 text-lg">
                <NavLinks location={location} closeMenu={closeMenu} />
                <div className="flex flex-col items-center space-y-4 w-full pt-6">
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/login" onClick={closeMenu}>Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/builder" onClick={closeMenu}>
                      <LayoutGrid className="mr-2 h-4 w-4" />
                      Construtor
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/design" onClick={closeMenu}>
                      <Palette className="mr-2 h-4 w-4" />
                      Design
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/settings" onClick={closeMenu}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/leads" onClick={closeMenu}>
                      <Users className="mr-2 h-4 w-4" />
                      Leads
                    </Link>
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

const NavLinks = ({ location, closeMenu }: { location: { pathname: string }, closeMenu: () => void }) => {
  const links = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/templates', label: 'Templates' },
    { path: '/pricing', label: 'Pricing' },
  ];

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          onClick={closeMenu}
          className={cn(
            "relative font-medium transition-colors hover:text-primary",
            location.pathname === link.path
              ? "text-primary"
              : "text-foreground/80 hover:text-foreground",
            "md:py-2 py-4 block text-center md:text-left",
            "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:duration-300",
            location.pathname === link.path && "after:bg-primary after:scale-x-100 after:origin-bottom-left"
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
};

export default Header;
