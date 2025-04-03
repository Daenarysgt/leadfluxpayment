import React, { useState, useEffect } from 'react';
import { useStore } from "@/utils/store";
import { Funnel } from "@/utils/types";
import ProgressBar from './ProgressBar';
import CanvasPreview from './CanvasPreview';
import TraditionalPreview from './TraditionalPreview';

interface FunnelPreviewProps {
  isMobile?: boolean;
  funnel?: Funnel; // Funnel can be passed as prop
  stepIndex?: number; // Added stepIndex prop
  onNextStep?: (index: number) => void; // Added callback for step navigation
}

const FunnelPreview = ({ isMobile = false, funnel, stepIndex = 0, onNextStep }: FunnelPreviewProps) => {
  const { currentFunnel, currentStep } = useStore();
  const [activeStep, setActiveStep] = useState(stepIndex);
  
  // Use provided funnel or fall back to currentFunnel from store
  const activeFunnel = funnel || currentFunnel;
  
  // Reset active step when funnel changes or stepIndex changes
  useEffect(() => {
    setActiveStep(stepIndex);
  }, [funnel?.id, currentFunnel?.id, stepIndex]);

  // If no funnel is available, show a message
  if (!activeFunnel) {
    return <div className="text-center py-8">No funnel selected</div>;
  }

  // Make sure activeStep is within bounds of available steps
  const safeCurrentStep = Math.min(activeStep, activeFunnel.steps.length - 1);
  const stepData = activeFunnel.steps[safeCurrentStep];
  
  // If for some reason stepData is undefined, display a fallback
  if (!stepData) {
    return <div className="text-center py-8">No step data available</div>;
  }
  
  const { primaryColor, backgroundColor } = activeFunnel.settings;

  // Custom styles based on funnel settings
  const customStyles = {
    "--primary-color": primaryColor,
  } as React.CSSProperties;

  // Get the canvas elements from the current step's questions
  const canvasElements = stepData.canvasElements || [];

  const handleStepChange = (newStep: number) => {
    setActiveStep(newStep);
    
    // Notify parent component if callback is provided
    if (onNextStep) {
      onNextStep(newStep);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto" style={customStyles}>
      {activeFunnel.settings.showProgressBar && (
        <ProgressBar 
          currentStep={safeCurrentStep} 
          totalSteps={activeFunnel.steps.length} 
          primaryColor={primaryColor}
        />
      )}

      <div className="w-full">
        {canvasElements && canvasElements.length > 0 ? (
          // If we have canvas elements, render them
          <CanvasPreview 
            canvasElements={canvasElements} 
            activeStep={safeCurrentStep}
            onStepChange={handleStepChange}
            funnel={activeFunnel}
          />
        ) : (
          // Otherwise, fall back to the traditional question rendering
          <TraditionalPreview 
            stepData={stepData}
            primaryColor={primaryColor}
            activeStep={safeCurrentStep}
            totalSteps={activeFunnel.steps.length}
            onStepChange={handleStepChange}
            funnel={activeFunnel}
          />
        )}
      </div>
    </div>
  );
};

export default FunnelPreview;
