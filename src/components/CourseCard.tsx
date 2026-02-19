import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  image: string;
  description: string;
  onClick: () => void;
  variant?: "grid" | "list";
}

const CourseCard = ({ 
  id, 
  title, 
  image, 
  description, 
  onClick, 
  variant = "grid",
}: CourseCardProps) => {
  if (variant === "list") {
    return (
      <div 
        className="bg-card border border-border rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <div className="flex">
          <div className="relative w-32 h-24">
            <img
              src={image || '/placeholder.svg'}
              alt={title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-1 right-1 bg-success text-success-foreground text-xs">
              FREE
            </Badge>
          </div>
          
          <div className="flex-1 p-3 space-y-2">
            <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">{title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-medium">Watch Ad to Access</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-card border border-border rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="relative aspect-video">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
          FREE
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Free with Ad</span>
          </div>
        </div>
        
        <Button 
          onClick={onClick}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          View Course
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
