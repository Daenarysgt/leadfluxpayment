import React from "react";
import { cn } from "@/lib/utils";

interface DotsProps {
  color: string;
  size: string;
}

export const Dots: React.FC<DotsProps> = ({ color, size }) => {
  const dotSizeClasses = {
    small: "h-2 w-2",
    medium: "h-3 w-3",
    large: "h-4 w-4",
  };
  
  const dotSize = dotSizeClasses[size as keyof typeof dotSizeClasses] || dotSizeClasses.medium;
  
  return (
    <div className="flex justify-center items-center space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            dotSize
          )}
          style={{ 
            backgroundColor: color, 
            animationDelay: `${i * 0.1}s` 
          }}
        />
      ))}
    </div>
  );
}; 