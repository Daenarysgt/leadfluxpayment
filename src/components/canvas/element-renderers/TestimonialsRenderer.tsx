import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { cn } from "@/lib/utils";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

const TestimonialsRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  
  // Default style to rectangular if not specified
  const displayStyle = content?.style?.displayStyle || "rectangular";
  
  // Get testimonials or use empty array if none
  const testimonials = content?.testimonials || [];
  
  // Estado para o carrossel
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Obter a margem superior definida no estilo
  const marginTop = content?.style?.marginTop;
  
  // Efeito para avançar automaticamente o carrossel a cada 5 segundos
  useEffect(() => {
    if (displayStyle === 'carousel' && testimonials.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % testimonials.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [displayStyle, testimonials.length]);
  
  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };
  
  const prevSlide = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };
  
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
  
  const renderTestimonial = (testimonial: any, index: number) => {
    // Obter as cores configuradas ou usar valores padrão
    const textColor = content?.style?.textColor || "#374151";
    const nameColor = content?.style?.nameColor || "#111827";
    const roleColor = content?.style?.roleColor || "#6B7280";
    
    return (
      <div 
        key={testimonial.id || index}
        className={cn(
          "border rounded-lg overflow-hidden",
          displayStyle === "rectangular" && "flex flex-col",
          displayStyle === "horizontal" && "flex flex-row items-center",
          displayStyle === "carousel" && "flex flex-col"
        )}
        style={{
          backgroundColor: content?.style?.backgroundColor || "white",
          borderColor: content?.style?.borderColor || "#e5e7eb"
        }}
      >
        <div className={cn(
          "p-4",
          displayStyle === "horizontal" && "flex-1"
        )}>
          {testimonial.rating && (
            <div className="mb-2">
              {renderStars(testimonial.rating)}
            </div>
          )}
          
          {testimonial.text && (
            <p 
              className={cn(
                "italic",
                displayStyle === "rectangular" && "mb-4",
                displayStyle === "grid" && "mb-3 line-clamp-3",
                displayStyle === "horizontal" && "mb-2"
              )}
              style={{ color: textColor }}
            >"{testimonial.text}"</p>
          )}
          
          <div className={cn(
            "flex items-center",
            displayStyle === "horizontal" && "mt-auto"
          )}>
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
                <p className="font-medium" style={{ color: nameColor }}>
                  {testimonial.name}
                </p>
              )}
              {testimonial.role && (
                <p className="text-sm" style={{ color: roleColor }}>
                  {testimonial.role}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: marginTop !== undefined ? `${marginTop}px` : undefined
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={containerStyle}>
        {content?.title && (
          <h2 className={cn(
            "text-xl font-semibold mb-4", 
            content?.style?.titleAlignment === "center" ? "text-center" : "text-left"
          )} style={{ color: content?.style?.titleColor || "#111827" }}>
            {content.title}
          </h2>
        )}
        
        {displayStyle === "rectangular" && (
          <div className="space-y-4">
            {testimonials.map((testimonial: any, index: number) => renderTestimonial(testimonial, index))}
          </div>
        )}
        
        {displayStyle === "horizontal" && (
          <div className="flex overflow-x-auto gap-4 pb-2">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={testimonial.id || index} className="flex-none w-[320px]">
                {renderTestimonial(testimonial, index)}
              </div>
            ))}
          </div>
        )}
        
        {displayStyle === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((testimonial: any, index: number) => renderTestimonial(testimonial, index))}
          </div>
        )}
        
        {displayStyle === "carousel" && testimonials.length > 0 && (
          <div className="relative">
            <div className="overflow-hidden rounded-lg">
              {renderTestimonial(testimonials[activeIndex], activeIndex)}
            </div>
            
            {testimonials.length > 1 && (
              <>
                <button 
                  onClick={prevSlide} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
                  aria-label="Depoimento anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={nextSlide} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md"
                  aria-label="Próximo depoimento"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                <div className="flex justify-center mt-3 gap-1">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "h-2 w-2 rounded-full",
                        activeIndex === index ? "bg-primary" : "bg-gray-300"
                      )}
                      aria-label={`Ir para depoimento ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default TestimonialsRenderer;
