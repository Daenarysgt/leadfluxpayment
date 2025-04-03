
import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const CarouselRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content } = element;
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Determine alignment class based on the content.alignment property
  const alignmentClass = useMemo(() => {
    return content?.alignment ? {
      'left': 'justify-start',
      'center': 'justify-center',
      'right': 'justify-end'
    }[content.alignment] : 'justify-center';
  }, [content?.alignment]);
  
  // Get aspect ratio value - memoized to avoid recalculation
  const aspectRatio = useMemo(() => {
    const getAspectRatioValue = (ratio?: string) => {
      switch (ratio) {
        case "1:1": return 1;
        case "16:9": return 16/9;
        case "9:16": return 9/16;
        case "4:3": return 4/3;
        case "original": return undefined; // Return undefined for original aspect ratio
        default: return 16/9;
      }
    };
    return getAspectRatioValue(content?.aspectRatio);
  }, [content?.aspectRatio]);
  
  // Auto-play functionality
  useEffect(() => {
    if (content?.autoPlay && content?.options && content.options.length > 1) {
      const interval = content.interval || 3;
      const timer = setInterval(() => {
        setActiveIndex((prev) => {
          if (prev + 1 >= (content.options?.length || 0)) {
            return 0;
          }
          return prev + 1;
        });
      }, interval * 1000);
      
      return () => clearInterval(timer);
    }
  }, [content?.autoPlay, content?.interval, content?.options]);
  
  // Create reference for image options
  const options = useMemo(() => content?.options || [], [content?.options]);
  const hasImages = options.length > 0;
  
  const handlePrevious = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev - 1 < 0) {
        return options.length - 1;
      }
      return prev - 1;
    });
  }, [options.length]);
  
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev + 1 >= options.length) {
        return 0;
      }
      return prev + 1;
    });
  }, [options.length]);
  
  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);
  
  // Memoize carousel items
  const carouselItems = useMemo(() => {
    return options.map((item, index) => (
      <div 
        key={item.id} 
        className={cn(
          "absolute inset-0 w-full h-full transition-opacity duration-500",
          index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
        )}
      >
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.text || `Slide ${index + 1}`} 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {item.text && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
            {item.text}
          </div>
        )}
      </div>
    ));
  }, [options, activeIndex]);
  
  return (
    <BaseElementRenderer {...props}>
      <div className={cn("relative w-full flex flex-col items-center", alignmentClass)}>
        {hasImages ? (
          <div className="w-full">
            {/* Main carousel view */}
            <div className="relative overflow-hidden rounded-md">
              {content?.aspectRatio !== "original" && aspectRatio ? (
                <AspectRatio ratio={aspectRatio}>
                  {carouselItems}
                </AspectRatio>
              ) : (
                // For original aspect ratio, don't wrap in AspectRatio component
                <div className="relative">
                  {carouselItems}
                </div>
              )}
              
              {/* Navigation arrows */}
              {options.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 text-white rounded-full p-1 hover:bg-black/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 text-white rounded-full p-1 hover:bg-black/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </>
              )}
            </div>
            
            {/* Indicators */}
            {options.length > 1 && (
              <div className="flex justify-center mt-2 gap-1">
                {options.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === activeIndex ? "bg-primary w-4" : "bg-gray-300"
                    )}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-40 w-full flex items-center justify-center bg-gray-100 rounded-md">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Adicione imagens ao carrossel</p>
            </div>
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default CarouselRenderer;
