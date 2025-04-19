import React from "react";

interface ProgressProps {
  color: string;
  size: string;
  progress: number;
}

export const Progress: React.FC<ProgressProps> = ({ color, size, progress }) => {
  const heightClasses: Record<string, string> = {
    small: "", // Vamos usar um valor personalizado para o small
    medium: "h-6",
    large: "h-8",
  };
  
  const barHeight = heightClasses[size as keyof typeof heightClasses] || heightClasses.medium;
  const customHeight = size === 'small' ? '18px' : undefined; // Valor intermediário entre h-4 (16px) e h-5 (20px)
  
  return (
    <div className="w-full max-w-lg">
      <div 
        className={`w-full ${barHeight} rounded-full overflow-hidden`}
        style={{
          backgroundColor: `${color}30`,
          ...(customHeight ? { height: customHeight } : {})
        }}
      >
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