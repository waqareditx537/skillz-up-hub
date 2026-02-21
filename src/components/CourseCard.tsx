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
      <article
        className="bg-card border border-border rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200"
        onClick={onClick}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
      >
        <div className="flex">
          <div className="relative w-28 sm:w-32 h-24 flex-shrink-0">
            <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            <Badge className="absolute top-1 left-1 bg-success text-success-foreground text-[10px] px-1.5">FREE</Badge>
          </div>
          <div className="flex-1 p-2.5 sm:p-3 space-y-1 sm:space-y-1.5 min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm text-card-foreground line-clamp-1">{title}</h3>
            {category && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-primary font-medium">
                <Tag className="h-3 w-3" />{category}
              </span>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{description}</p>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[10px] sm:text-xs text-primary font-medium">Watch Ad to Access</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 group"
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
        <Badge className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-success text-success-foreground text-[10px] sm:text-xs">FREE</Badge>
        {category && (
          <Badge variant="secondary" className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-[10px] sm:text-xs">{category}</Badge>
        )}
      </div>

      <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2">
        <h3 className="font-semibold text-card-foreground line-clamp-2 leading-snug text-xs sm:text-base">{title}</h3>
        <p className="text-[11px] sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">{description}</p>

        <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
          <span className="text-[10px] sm:text-sm text-primary font-medium">Free with Ad</span>
        </div>

        <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground mt-1 min-h-[36px] sm:min-h-[40px] text-xs sm:text-sm" size="sm">
          View Course
        </Button>
      </div>
    </article>
  );
};

export default CourseCard;
