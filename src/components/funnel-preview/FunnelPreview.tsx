import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from "@/utils/store";
import { Funnel } from "@/utils/types";
import ProgressBar from './ProgressBar';
import CanvasPreview from './CanvasPreview';
import TraditionalPreview from './TraditionalPreview';
import FacebookPixel from '@/components/pixel/FacebookPixel';
import useImagePreloader from '@/hooks/useImagePreloader';

interface FunnelPreviewProps {
  isMobile?: boolean;
  funnel?: Funnel; // Funnel can be passed as prop
  stepIndex?: number; // Added stepIndex prop
  onNextStep?: (index: number) => void; // Added callback for step navigation
}

// Estilos de transição para uso nas transições entre etapas
const transitionStyles = `
  .step-transition {
    animation: stepTransition 0.3s ease-out forwards;
  }
  
  @keyframes stepTransition {
    from {
      opacity: 0.7;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FunnelPreview = ({ isMobile = false, funnel, stepIndex = 0, onNextStep }: FunnelPreviewProps) => {
  const { currentFunnel, currentStep } = useStore();
  const [activeStep, setActiveStep] = useState(stepIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use provided funnel or fall back to currentFunnel from store
  const activeFunnel = funnel || currentFunnel;
  
  // Usar o hook de pré-carregamento de imagens
  const { imagesPreloaded, isPreloading } = useImagePreloader(activeFunnel, activeStep);
  
  useEffect(() => {
    if (isPreloading) {
      console.log('[FunnelPreview] Pré-carregando imagens das próximas etapas...');
    }
    if (imagesPreloaded) {
      console.log('[FunnelPreview] Imagens pré-carregadas com sucesso!');
    }
  }, [isPreloading, imagesPreloaded]);
  
  // Reset active step when funnel changes or stepIndex changes
  useEffect(() => {
    setActiveStep(stepIndex);
  }, [funnel?.id, currentFunnel?.id, stepIndex]);

  // Aplicar animação de transição quando a etapa muda
  useEffect(() => {
    if (containerRef.current) {
      // Remover a classe para resetar a animação
      containerRef.current.classList.remove('step-transition');
      
      // Forçar um reflow para garantir que a classe seja aplicada novamente
      void containerRef.current.offsetWidth;
      
      // Adicionar a classe para animar
      containerRef.current.classList.add('step-transition');
    }
  }, [activeStep]);

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
    <>
      {/* Adicionar estilos de transição globalmente */}
      <div dangerouslySetInnerHTML={{ __html: `<style>${transitionStyles}</style>` }} />
      
      <div
        className="flex flex-col w-full min-h-screen transition-colors duration-300"
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

        <div 
          ref={containerRef}
          className="flex flex-col items-center w-full max-w-xl mx-auto step-transition" 
          style={customStyles}
        >
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
            {/* Indicador de pré-carregamento mais sutil */}
            {isPreloading && (
              <div className="absolute top-2 right-2 w-2 h-2 opacity-50">
                <div className="animate-ping absolute h-2 w-2 rounded-full bg-blue-400 opacity-50"></div>
                <div className="relative rounded-full h-2 w-2 bg-blue-500"></div>
              </div>
            )}
            
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
    </>
  );
};

export default FunnelPreview;
