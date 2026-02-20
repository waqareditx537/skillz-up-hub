import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Tag } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  image: string;
  description: string;
  category?: string;
  onClick: () => void;
  variant?: "grid" | "list";
}

const CourseCard = ({ title, image, description, category, onClick, variant = "grid" }: CourseCardProps) => {
  if (variant === "list") {
    return (
      <div
        className="bg-card border border-border rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        onClick={onClick}
      >
        <div className="flex">
          <div className="relative w-32 h-24 flex-shrink-0">
            <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
            <Badge className="absolute top-1 left-1 bg-success text-success-foreground text-xs px-1.5">FREE</Badge>
          </div>
          <div className="flex-1 p-3 space-y-1.5 min-w-0">
            <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">{title}</h3>
            {category && (
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                <Tag className="h-3 w-3" />{category}
              </span>
            )}
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            <div className="flex items-center gap-1">
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
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-2 left-2 bg-success text-success-foreground text-xs">FREE</Badge>
        {category && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">{category}</Badge>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-card-foreground line-clamp-2 leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        <div className="flex items-center gap-1.5 pt-1">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm text-primary font-medium">Free with Ad</span>
        </div>

        <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground mt-1" size="sm">
          View Course
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
