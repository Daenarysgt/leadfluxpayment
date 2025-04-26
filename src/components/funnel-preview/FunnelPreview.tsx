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

// Estilos de transição CSS para transições suaves entre etapas
const transitionStyles = `
  @keyframes smooth-fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .smooth-transition {
    animation: smooth-fade-in 0.3s ease-out forwards;
    will-change: opacity, transform;
    backface-visibility: hidden;
    perspective: 1000;
    transform: translate3d(0,0,0);
  }
`;

const FunnelPreview = ({ isMobile = false, funnel, stepIndex = 0, onNextStep }: FunnelPreviewProps) => {
  const { currentFunnel, currentStep } = useStore();
  const [activeStep, setActiveStep] = useState(stepIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Use provided funnel or fall back to currentFunnel from store
  const activeFunnel = funnel || currentFunnel;
  
  // Usar o hook de pré-carregamento de imagens sem mostrar indicadores visuais
  const { imagesPreloaded } = useImagePreloader(activeFunnel, activeStep);
  
  // Reset active step when funnel changes or stepIndex changes
  useEffect(() => {
    setActiveStep(stepIndex);
  }, [funnel?.id, currentFunnel?.id, stepIndex]);

  // Adicionar efeito de transição suave quando muda de etapa
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      
      // Iniciar a transição
      setIsTransitioning(true);
      
      // Remover qualquer classe de animação anterior
      container.classList.remove('smooth-transition');
      
      // Reset do estilo para iniciar a animação
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';
      
      // Forçar reflow para iniciar a animação corretamente
      void container.offsetWidth;
      
      // Adicionar classe para iniciar a animação
      container.classList.add('smooth-transition');
      
      // Restaurar o estilo normal quando a animação terminar
      const animationEnd = () => {
        setIsTransitioning(false);
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        container.removeEventListener('animationend', animationEnd);
      };
      
      container.addEventListener('animationend', animationEnd);
      
      return () => {
        container.removeEventListener('animationend', animationEnd);
      };
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
        className="flex flex-col w-full min-h-screen"
        style={{ 
          backgroundColor: funnelBgColor,
          transition: 'background-color 0.5s ease-out' // Transição suave para mudanças de fundo
        }}
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
          className="flex flex-col items-center w-full max-w-xl mx-auto smooth-transition" 
          style={{
            ...customStyles,
            opacity: 1,
            willChange: 'opacity, transform',
            WebkitBackfaceVisibility: 'hidden',
            WebkitPerspective: '1000',
            WebkitTransformStyle: 'preserve-3d'
          }}
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
                  e.currentTarget.style.display = 'none';
                }}
                style={{ 
                  opacity: 1,
                  transition: 'opacity 0.3s ease-out'
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

          <div className="w-full" style={{ opacity: 1 }}>
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
