import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen } from "lucide-react";

const SiteHeader = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          SkillzUp
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="/" className="hover:opacity-80 transition-opacity">Home</a>
          <a href="/courses" className="hover:opacity-80 transition-opacity">Courses</a>
          <a href="/about" className="hover:opacity-80 transition-opacity">About</a>
          <a href="/contact" className="hover:opacity-80 transition-opacity">Contact</a>
          <a href="/copyright" className="hover:opacity-80 transition-opacity">Copyright</a>
          <a href="/help" className="hover:opacity-80 transition-opacity">Help</a>
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-primary-foreground hover:bg-primary-hover"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-primary border-t border-primary-hover px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
          <a href="/" className="hover:opacity-80 py-1" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/courses" className="hover:opacity-80 py-1" onClick={() => setMenuOpen(false)}>Courses</a>
          <a href="/about" className="hover:opacity-80 py-1" onClick={() => setMenuOpen(false)}>About Us</a>
          <a href="/contact" className="hover:opacity-80 py-1" onClick={() => setMenuOpen(false)}>Contact Us</a>
          <a href="/copyright" className="hover:opacity-80 py-1" onClick={() => setMenuOpen(false)}>Copyright & DMCA</a>
          <a href="/help" className="hover:opacity-80 py-1" onClick={() => setMenuOpen(false)}>Help</a>
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
