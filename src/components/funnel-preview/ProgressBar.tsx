import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  primaryColor: string;
}

const ProgressBar = ({ currentStep, totalSteps, primaryColor }: ProgressBarProps) => {
  return (
    <div className="w-full bg-gray-200 h-2.5 rounded-none overflow-hidden progress-bar-fixed">
      <div 
        className="h-full transition-all duration-500 ease-out"
        style={{ 
          width: `${((currentStep + 1) / totalSteps) * 100}%`,
          backgroundColor: primaryColor 
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
