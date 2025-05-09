import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  primaryColor: string;
  isMobile?: boolean;
}

const ProgressBar = ({ currentStep, totalSteps, primaryColor, isMobile = false }: ProgressBarProps) => {
  return (
    <div 
      className={`rounded-full overflow-hidden mb-3 ${isMobile ? 'mx-4 w-[calc(100%-2rem)]' : 'w-full'}`}
      style={{ 
        backgroundColor: `${primaryColor}30`, /* Usando a mesma cor do progresso com 30% de opacidade */
        height: '10px' /* Valor intermediário entre h-2 (8px) e h-3 (12px) */
      }}>
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
