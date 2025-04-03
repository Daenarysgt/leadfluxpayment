
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const TestimonialsRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
  // Default style to rectangular if not specified
  const displayStyle = content?.style?.displayStyle || "rectangular";
  
  // Get testimonials or use empty array if none
  const testimonials = content?.testimonials || [];
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4">
        {content?.title && (
          <h2 className={cn(
            "text-xl font-semibold mb-4", 
            content?.style?.titleAlignment === "center" ? "text-center" : "text-left"
          )}>
            {content.title}
          </h2>
        )}
        
        <div className={cn(
          "grid gap-4",
          displayStyle === "rectangular" && "grid-cols-1"
        )}>
          {testimonials.map((testimonial: any) => (
            <div 
              key={testimonial.id}
              className={cn(
                "border rounded-lg overflow-hidden",
                displayStyle === "rectangular" && "flex flex-col"
              )}
              style={{
                backgroundColor: content?.style?.backgroundColor || "white",
                borderColor: content?.style?.borderColor || "#e5e7eb"
              }}
            >
              <div className="p-4">
                {testimonial.rating && (
                  <div className="mb-2">
                    {renderStars(testimonial.rating)}
                  </div>
                )}
                
                {testimonial.text && (
                  <p className="text-gray-700 italic mb-4">"{testimonial.text}"</p>
                )}
                
                <div className="flex items-center">
                  <Avatar className="mr-3 h-10 w-10">
                    {testimonial.avatar ? (
                      <AvatarImage 
                        src={testimonial.avatar} 
                        alt={testimonial.name || ""} 
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-100 text-gray-500">
                        {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div>
                    {testimonial.name && (
                      <p className="font-medium">{testimonial.name}</p>
                    )}
                    {testimonial.role && (
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default TestimonialsRenderer;
