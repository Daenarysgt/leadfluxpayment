import React from "react";

interface ProgressProps {
  color: string;
  size: string;
  progress: number;
}

export const Progress: React.FC<ProgressProps> = ({ color, size, progress }) => {
  const heightClasses = {
    small: "h-2",
    medium: "h-3",
    large: "h-4",
  };
  
  const barHeight = heightClasses[size as keyof typeof heightClasses] || heightClasses.medium;
  
  return (
    <div className="w-full max-w-md">
      <div className={`w-full ${barHeight} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${progress}%`,
            backgroundColor: color 
          }}
        />
      </div>
      <div className="text-center mt-2" style={{ color }}>
        {progress}%
      </div>
    </div>
  );
}; 