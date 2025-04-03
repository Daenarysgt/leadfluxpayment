
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Star, Heart, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const RatingRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content = {} } = element;
  const style = content.style || {};
  
  // Get rating settings from content or use defaults
  const title = content.title || "Avalie sua experiência";
  const description = content.description || "";
  const minValue = content.minValue || 1;
  const maxValue = content.maxValue || 5;
  const defaultValue = content.defaultValue || 0;
  
  // Style options
  const ratingType = style.ratingType || 'stars';
  const activeColor = style.activeColor || '#FFB400';
  const inactiveColor = style.inactiveColor || '#D1D5DB';
  const size = style.size || 'medium';
  const alignment = style.alignment || 'center';
  const showLabels = style.showLabels !== false;
  const allowHalf = style.allowHalf === true && (ratingType === 'stars' || ratingType === 'hearts');
  
  // State for interaction
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(
    defaultValue > 0 ? defaultValue : null
  );
  
  // Create array of rating values
  const ratingValues = Array.from({ length: maxValue - minValue + 1 }, (_, i) => i + minValue);
  
  // Determine size classes
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-6 w-6",
    large: "h-8 w-8",
  };
  
  const iconSizeClass = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium;
  
  // Handle item click
  const handleRatingClick = (rating: number) => {
    if (element.previewMode) {
      setSelectedRating(rating);
      
      // If there's an update function, use it
      if (props.onUpdate) {
        props.onUpdate({
          ...element,
          content: {
            ...element.content,
            selectedValue: rating
          }
        });
      }
    }
  };

  // Render the appropriate icon based on the rating type
  const renderRatingIcon = (value: number, active: boolean) => {
    const isActive = active;
    const iconProps = {
      className: cn(
        iconSizeClass,
        "transition-transform",
        element.previewMode && "cursor-pointer hover:scale-110"
      ),
      style: { 
        color: isActive ? activeColor : inactiveColor,
        fill: isActive ? activeColor : "none" 
      }
    };

    switch (ratingType) {
      case 'hearts':
        return <Heart {...iconProps} />;
      case 'thumbs':
        return <ThumbsUp {...iconProps} />;
      case 'numbers':
        return (
          <div 
            className={cn(
              "flex items-center justify-center rounded-full",
              iconSizeClass,
              element.previewMode && "cursor-pointer hover:scale-110"
            )}
            style={{ 
              backgroundColor: isActive ? activeColor : '#F3F4F6',
              color: isActive ? 'white' : '#6B7280',
              width: iconSizeClass === "h-4 w-4" ? "1.5rem" : 
                     iconSizeClass === "h-6 w-6" ? "2rem" : "2.5rem",
              height: iconSizeClass === "h-4 w-4" ? "1.5rem" : 
                      iconSizeClass === "h-6 w-6" ? "2rem" : "2.5rem"
            }}
          >
            {value}
          </div>
        );
      case 'stars':
      default:
        return <Star {...iconProps} />;
    }
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4">
        {title && (
          <div className={cn("mb-3", `text-${alignment}`)}>
            <h3 className="text-lg font-medium">{title}</h3>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
        )}
        
        <div className={cn("flex gap-2 my-4", {
          "justify-center": alignment === "center",
          "justify-start": alignment === "left",
          "justify-end": alignment === "right"
        })}>
          {ratingValues.map((rating) => (
            <div 
              key={rating}
              onClick={() => handleRatingClick(rating)}
              onMouseEnter={() => element.previewMode && setHoveredRating(rating)}
              onMouseLeave={() => element.previewMode && setHoveredRating(null)}
            >
              {renderRatingIcon(
                rating, 
                (hoveredRating !== null ? rating <= hoveredRating : rating <= (selectedRating || 0))
              )}
            </div>
          ))}
        </div>
        
        {showLabels && (
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>{minValue}</span>
            <span>{maxValue}</span>
          </div>
        )}
        
        {selectedRating && (
          <div className={cn("mt-4", `text-${alignment}`)}>
            <p className="font-medium">Sua avaliação: {selectedRating}</p>
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default RatingRenderer;
