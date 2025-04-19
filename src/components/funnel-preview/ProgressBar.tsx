import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  primaryColor: string;
  isEditorMode?: boolean;
}

const ProgressBar = ({ 
  currentStep, 
  totalSteps, 
  primaryColor,
  isEditorMode = false
}: ProgressBarProps) => {
  // Definir classe com base no modo (editor ou preview)
  const containerClass = isEditorMode 
    ? "w-full overflow-hidden relative h-3" 
    : "funnel-progress-bar";

  return (
    <div className={containerClass}>
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
