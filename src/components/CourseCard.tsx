import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  id: number;
  title: string;
  image: string;
  price: number;
  mrp: number;
  description: string;
  onClick: () => void;
  variant?: "grid" | "list";
  rating?: number;
  students?: number;
  duration?: string;
}

const CourseCard = ({ 
  id, 
  title, 
  image, 
  price, 
  mrp, 
  description, 
  onClick, 
  variant = "grid",
  rating,
  students,
  duration 
}: CourseCardProps) => {
  const discount = Math.round(((mrp - price) / mrp) * 100);

  if (variant === "list") {
    return (
      <div 
        className="bg-card border border-border rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <div className="flex">
          <div className="relative w-32 h-24">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute top-1 right-1 bg-discount text-discount-foreground text-xs"
              >
                {discount}% OFF
              </Badge>
            )}
          </div>
          
          <div className="flex-1 p-3 space-y-2">
            <h3 className="font-semibold text-sm text-card-foreground line-clamp-1">{title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-success">Rs {price}</span>
                {mrp > price && (
                  <span className="text-xs text-course-mrp line-through">Rs {mrp}</span>
                )}
              </div>
              {rating && (
                <div className="text-xs text-muted-foreground">
                  ⭐ {rating}
                </div>
              )}
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
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        {discount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute top-2 right-2 bg-discount text-discount-foreground"
          >
            {discount}% OFF
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        
        {(rating || students || duration) && (
          <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
            {rating && <span>⭐ {rating}</span>}
            {students && <span>{students} students</span>}
            {duration && <span>{duration}</span>}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-success">Rs {price}</span>
            {mrp > price && (
              <span className="text-sm text-course-mrp line-through">Rs {mrp}</span>
            )}
          </div>
        </div>
        
        <Button 
          onClick={onClick}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;