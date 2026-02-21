import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/copyright", label: "Copyright" },
  { href: "/help", label: "Help" },
];

const SiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (href: string) => {
    navigate(href);
    setMenuOpen(false);
  };

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => handleNav("/")}
          className="text-lg sm:text-xl font-bold flex items-center gap-2 active:opacity-70 transition-opacity"
          aria-label="SkillzUp Home"
        >
          <BookOpen className="h-5 w-5" />
          SkillzUp
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium" aria-label="Main navigation">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className={`hover:opacity-80 transition-opacity py-1 ${
                location.pathname === link.href ? "border-b-2 border-primary-foreground" : ""
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-primary-foreground hover:bg-primary-hover min-h-[44px] min-w-[44px]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav
          className="md:hidden bg-primary border-t border-primary-foreground/20 px-4 pb-4 flex flex-col gap-1 text-sm font-medium animate-fade-in"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className={`text-left py-3 px-2 rounded-lg active:bg-primary-hover transition-colors min-h-[44px] ${
                location.pathname === link.href ? "bg-primary-hover" : ""
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
