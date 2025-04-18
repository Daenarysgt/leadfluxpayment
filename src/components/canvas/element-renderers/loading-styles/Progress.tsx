import React from "react";

interface ProgressProps {
  color: string;
  size: string;
  progress: number;
}

export const Progress: React.FC<ProgressProps> = ({ color, size, progress }) => {
  const heightClasses = {
    small: "h-4",
    medium: "h-6",
    large: "h-8",
  };
  
  const barHeight = heightClasses[size as keyof typeof heightClasses] || heightClasses.medium;
  
  return (
    <div className="w-full max-w-lg">
      <div className={`w-full ${barHeight} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${progress}%`,
            backgroundColor: color 
          }}
        />
      </div>
      <div className="text-center mt-2 text-base font-medium" style={{ color }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
}; 