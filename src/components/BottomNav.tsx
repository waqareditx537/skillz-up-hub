import { Home, BookOpen, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "mycourses", label: "My Courses", icon: BookOpen, path: "/mycourses" },
    { id: "help", label: "Help", icon: HelpCircle, path: "/help" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  const handleTabClick = (tab: any) => {
    onTabChange(tab.id);
    window.location.href = tab.path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => handleTabClick(tab)}
            className={`flex flex-col items-center py-2 px-3 ${
              activeTab === tab.id 
                ? "text-primary bg-accent" 
                : "text-muted-foreground"
            }`}
          >
            <tab.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{tab.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;