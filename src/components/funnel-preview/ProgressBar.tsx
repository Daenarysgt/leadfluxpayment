import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  primaryColor: string;
}

const ProgressBar = ({ currentStep, totalSteps, primaryColor }: ProgressBarProps) => {
  return (
    <div className="funnel-progress-bar">
      <div className="track"></div>
      <div 
        className="progress"
        style={{ 
          width: `${((currentStep + 1) / totalSteps) * 100}%`,
          backgroundColor: primaryColor 
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
