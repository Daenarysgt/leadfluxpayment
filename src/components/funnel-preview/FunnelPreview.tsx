import React, { useState, useEffect } from 'react';
import { useStore } from "@/utils/store";
import { Funnel } from "@/utils/types";
import ProgressBar from './ProgressBar';
import CanvasPreview from './CanvasPreview';
import TraditionalPreview from './TraditionalPreview';
import FacebookPixel from '@/components/pixel/FacebookPixel';

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
  
  const { primaryColor, backgroundColor, logo } = activeFunnel.settings;
  // Use backgroundColor from settings or fallback to white
  const funnelBgColor = backgroundColor || '#ffffff';
  
  // Debug log para verificar se o logo está chegando
  console.log("FunnelPreview - Logo encontrado nas settings:", !!logo, typeof logo);
  console.log("FunnelPreview - Valor do logo:", logo);
  console.log("FunnelPreview - Settings completo:", activeFunnel.settings);
  
  // Verificar se o logo é uma string base64 válida
  let validLogo = logo;
  if (typeof logo === 'string' && !logo.startsWith('data:image/')) {
    console.error("FunnelPreview - Logo não é uma string base64 válida");
    validLogo = null;
  }

  // Check if this is the last step of the funnel
  const isLastStep = safeCurrentStep === activeFunnel.steps.length - 1;

  // Custom styles based on funnel settings
  const customStyles = {
    "--primary-color": primaryColor,
  } as React.CSSProperties;

  // Get the canvas elements from the current step's questions
  const canvasElements = stepData.canvasElements || [];

  const handleStepChange = (newStep: number) => {
    console.log("FunnelPreview - handleStepChange called, navigating from", safeCurrentStep, "to", newStep);
    setActiveStep(newStep);
    
    // Notify parent component if callback is provided
    if (onNextStep) {
      console.log("FunnelPreview - Notifying parent component of step change");
      onNextStep(newStep);
    }
  };

  return (
    <div
      className="flex flex-col w-full min-h-screen transition-all duration-500"
      style={{ backgroundColor: funnelBgColor }}
    >
      {/* Facebook Pixel integration with proper parameters */}
      {activeFunnel.settings.facebookPixelId && (
        <FacebookPixel 
          pixelId={activeFunnel.settings.facebookPixelId}
          trackPageView={activeFunnel.settings.pixelTracking?.pageView !== false}
          trackRegistrationComplete={isLastStep && activeFunnel.settings.pixelTracking?.completeRegistration !== false}
        />
      )}

      <div className="flex flex-col items-center w-full max-w-xl mx-auto" style={customStyles}>
        {/* Logo */}
        {validLogo && (
          <div className="w-full flex justify-center py-4">
            <img 
              src={validLogo} 
              alt="Logo" 
              className="max-h-14 object-contain"
              onError={(e) => {
                console.error("FunnelPreview - Erro ao carregar logo:", e);
                // Adicionar fallback se necessário
                // e.currentTarget.src = '/placeholder-logo.png';
                // Ou esconder o elemento
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log("FunnelPreview - Logo carregado com sucesso");
              }}
            />
          </div>
        )}
        
        {/* Progress Bar */}
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
    </div>
  );
};

export default FunnelPreview;
