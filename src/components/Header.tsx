import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
}

const Header = ({ onMenuClick, onProfileClick }: HeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
      <div className="flex items-center justify-between mb-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="text-primary-foreground hover:bg-primary-hover"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-bold">SkillzUp</h1>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onProfileClick}
          className="text-primary-foreground hover:bg-primary-hover"
        >
          <User className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search courses..." 
          className="pl-10 bg-background text-foreground rounded-full"
        />
      </div>
    </header>
  );
};

export default Header;