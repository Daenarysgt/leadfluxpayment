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
  isPreviewPage?: boolean; // Added to detect if we're in preview page mode
  centerContent?: boolean; // Added to center content
  renderAllSteps?: boolean; // Nova opção para renderizar todas as etapas de uma vez
}

const FunnelPreview = ({ 
  isMobile = false, 
  funnel, 
  stepIndex = 0, 
  onNextStep, 
  isPreviewPage = false, 
  centerContent = false,
  renderAllSteps = false 
}: FunnelPreviewProps) => {
  const { currentFunnel, currentStep } = useStore();
  const [activeStep, setActiveStep] = useState(stepIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect if we're in the preview page by checking URL if not explicitly specified
  const [isInPreviewMode, setIsInPreviewMode] = useState(isPreviewPage);
  
  useEffect(() => {
    if (!isPreviewPage) {
      // Check URL for /preview/ path
      const inPreviewPage = window.location.pathname.includes('/preview/');
      setIsInPreviewMode(inPreviewPage);
    }
  }, [isPreviewPage]);
  
  // Use provided funnel or fall back to currentFunnel from store
  const activeFunnel = funnel || currentFunnel;
  
  // Usar o hook de pré-carregamento de imagens sem mostrar indicadores visuais
  const { imagesPreloaded } = useImagePreloader(activeFunnel, activeStep);
  
  // Reset active step when funnel changes or stepIndex changes
  useEffect(() => {
    setActiveStep(stepIndex);
    
    // Também forçar scroll para o topo quando o stepIndex mudar externamente
    if (isMobile && !renderAllSteps) {
      resetScrollPosition();
    }
  }, [funnel?.id, currentFunnel?.id, stepIndex, isMobile, renderAllSteps]);

  // Função unificada para redefinir a posição do scroll
  const resetScrollPosition = () => {
    console.log("Executando reset da posição de scroll...");
    
    // 1. Primeiro, tentar o método mais direto
    window.scrollTo(0, 0);
    
    // 2. Tentar uma abordagem mais agressiva com setTimeout
    setTimeout(() => {
      // Forçar scroll em todas as possíveis camadas
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      }
      
      // Contêiner local
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      
      // 3. Tentar obter qualquer elemento scrollável pai
      let parent = containerRef.current?.parentElement;
      while (parent) {
        parent.scrollTop = 0;
        parent = parent.parentElement;
      }
      
      // 4. Para mobile, também tentar history.scrollRestoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      // 5. Tentar desabilitar temporariamente o overflow para forçar o reposicionamento
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Restaurar depois de um breve período
      setTimeout(() => {
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, 0);
      }, 50);
      
    }, 0);
  };

  const handleStepChange = (newStep: number) => {
    // Se estiver no modo de renderização única, resetar o scroll
    if (isMobile && !renderAllSteps) {
      resetScrollPosition();
    } else if (renderAllSteps) {
      // No modo de renderização completa, fazer scroll para a seção correspondente
      const stepElement = document.getElementById(`funnel-step-${newStep}`);
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    // Atualizar estado local
    setActiveStep(newStep);
    
    // Notificar componente pai se o callback for fornecido
    if (onNextStep) {
      onNextStep(newStep);
    }
  };

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
  
  // Check if this is the last step of the funnel
  const isLastStep = safeCurrentStep === activeFunnel.steps.length - 1;

  // Get the canvas elements from the current step's questions
  const canvasElements = stepData.canvasElements || [];

  // Se estamos em preview mode, renderizar apenas o CanvasPreview sem nenhum wrapper
  if (isInPreviewMode && canvasElements && canvasElements.length > 0) {
    return (
      <CanvasPreview 
        canvasElements={canvasElements} 
        activeStep={safeCurrentStep}
        onStepChange={handleStepChange}
        funnel={activeFunnel}
        isMobile={isMobile}
        isPreviewPage={true}
        renderAllSteps={renderAllSteps}
      />
    );
  }

  // Regular rendering for builder mode
  return (
    <>
      <div
        className="flex flex-col w-full min-h-screen"
        style={{ 
          backgroundColor: backgroundColor || '#ffffff',
          transition: 'none' // Desativar transições
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
          className={`flex flex-col items-center w-full max-w-xl mx-auto ${centerContent ? 'justify-center' : ''}`}
          style={{
            "--primary-color": primaryColor,
            opacity: 1, // Forçar opacidade total
            transition: 'none', // Desativar transições
          } as React.CSSProperties}
        >
          {/* Logo */}
          {logo && typeof logo === 'string' && logo.startsWith('data:image/') && (
            <div className="w-full flex justify-center py-4">
              <img 
                src={logo} 
                alt="Logo" 
                className="max-h-14 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                style={{ opacity: 1 }} // Forçar opacidade total
              />
            </div>
          )}
          
          {/* Progress Bar - Mostrar apenas se não estiver renderizando todas as etapas */}
          {activeFunnel.settings.showProgressBar && !renderAllSteps && (
            <ProgressBar 
              currentStep={safeCurrentStep} 
              totalSteps={activeFunnel.steps.length} 
              primaryColor={primaryColor}
              isMobile={isMobile}
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
                isMobile={isMobile}
                renderAllSteps={renderAllSteps}
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
