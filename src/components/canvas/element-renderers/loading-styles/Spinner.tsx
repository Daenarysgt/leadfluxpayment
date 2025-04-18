import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  color: string;
  size: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ color, size }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-16 w-16",
  };
  
  return (
    <div className="flex justify-center items-center w-full">
      <Loader 
        className={cn("animate-spin", sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.medium)} 
        style={{ color }}
      />
    </div>
  );
}; 