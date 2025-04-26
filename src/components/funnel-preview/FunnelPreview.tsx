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

// CSS para controlar as transições entre etapas - uma abordagem com overlay
const transitionCSS = `
  .funnel-container {
    position: relative;
  }
  
  .overlay-transition {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 1);
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }
  
  .overlay-transition.active {
    opacity: 1;
  }
  
  .overlay-transition.fade-out {
    opacity: 0;
  }
`;

const FunnelPreview = ({ isMobile = false, funnel, stepIndex = 0, onNextStep }: FunnelPreviewProps) => {
  const { currentFunnel, currentStep } = useStore();
  const [activeStep, setActiveStep] = useState(stepIndex);
  const [previousStep, setPreviousStep] = useState(stepIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);
  
  // Use provided funnel or fall back to currentFunnel from store
  const activeFunnel = funnel || currentFunnel;
  
  // Usar o hook de pré-carregamento de imagens sem mostrar indicadores visuais
  const { imagesPreloaded } = useImagePreloader(activeFunnel, activeStep);
  
  // Reset active step when funnel changes or stepIndex changes
  useEffect(() => {
    setActiveStep(stepIndex);
  }, [funnel?.id, currentFunnel?.id, stepIndex]);

  // Implementando transição com overlay para eliminar o flash
  useEffect(() => {
    // Não fazer transição na primeira renderização
    if (previousStep === activeStep) return;
    
    // Função para gerenciar a transição entre etapas
    const handleTransition = async () => {
      if (!overlayRef.current) return;
      
      try {
        // 1. Indicar que estamos em transição
        setTransitioning(true);
        
        // 2. Fade-in do overlay branco
        overlayRef.current.classList.add('active');
        
        // 3. Pequena pausa para dar tempo ao overlay cobrir completamente
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 4. Nesse momento a mudança de etapa já aconteceu pelo React
        // e o novo conteúdo está pronto mas coberto pelo overlay
        
        // 5. Fade-out do overlay revelando o novo conteúdo
        overlayRef.current.classList.add('fade-out');
        
        // 6. Esperar a animação fade-out terminar
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // 7. Limpar classes, voltando ao estado inicial
        overlayRef.current.classList.remove('active', 'fade-out');
        
        // 8. Finalizar o estado de transição
        setTransitioning(false);
      } catch (error) {
        console.error("Erro durante a transição:", error);
        setTransitioning(false);
        
        // Garantir que o overlay seja removido mesmo em caso de erro
        if (overlayRef.current) {
          overlayRef.current.classList.remove('active', 'fade-out');
        }
      }
    };
    
    // Executar transição
    handleTransition();
    
    // Atualizar referência do step anterior
    setPreviousStep(activeStep);
  }, [activeStep, previousStep]);

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
    // Evitar navegação durante transição para prevenir flashes
    if (transitioning) return;
    
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
      {/* Estilos CSS para as transições */}
      <style>{transitionCSS}</style>
      
      {/* Overlay para transições entre etapas */}
      <div ref={overlayRef} className="overlay-transition"></div>
      
      <div
        className="flex flex-col w-full min-h-screen funnel-container"
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
          className="flex flex-col items-center w-full max-w-xl mx-auto" 
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
                  e.currentTarget.style.display = 'none';
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
    </>
  );
};

export default FunnelPreview;
