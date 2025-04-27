import { useStore } from "@/utils/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionType, Funnel } from "@/utils/types";
import { ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import ElementFactory from "@/components/canvas/element-renderers/ElementFactory";
import CanvasPreview from "@/components/funnel-preview/CanvasPreview";
import FacebookPixel from '@/components/pixel/FacebookPixel';
import TraditionalQuestionRenderer from "@/components/funnel-preview/TraditionalQuestionRenderer";

interface FunnelPreviewProps {
  isMobile?: boolean;
  funnel?: Funnel;
  stepIndex?: number;
  onNextStep?: (index: number) => void;
  centerContent?: boolean;
}

const FunnelPreview = ({ isMobile = false, funnel, stepIndex = 0, onNextStep, centerContent = false }: FunnelPreviewProps) => {
  const { currentFunnel, currentStep } = useStore();
  const [activeStep, setActiveStep] = useState(stepIndex);
  const [shouldCenter, setShouldCenter] = useState(centerContent);
  const [dataReady, setDataReady] = useState(false);
  const [renderKey, setRenderKey] = useState(`preview-${Date.now()}`);
  
  // Use provided funnel or fall back to currentFunnel from store
  const activeFunnel = funnel || currentFunnel;
  
  // Garantir que o componente seja remontado quando o funil muda
  useEffect(() => {
    if (funnel?.id) {
      setRenderKey(`preview-${funnel.id}-${Date.now()}`);
    }
  }, [funnel?.id]);
  
  // Verificar se os dados estão prontos para renderização
  useEffect(() => {
    // Reset dataReady quando o funil mudar
    setDataReady(false);
    
    if (!activeFunnel) {
      console.log("FunnelPreview - Funil não disponível");
      return;
    }
    
    if (!Array.isArray(activeFunnel.steps) || activeFunnel.steps.length === 0) {
      console.log("FunnelPreview - Funil não tem steps");
      return;
    }
    
    const safeStepIndex = Math.min(activeStep, activeFunnel.steps.length - 1);
    const stepData = activeFunnel.steps[safeStepIndex];
    
    if (!stepData) {
      console.log("FunnelPreview - Step não encontrado para índice:", safeStepIndex);
      return;
    }
    
    // Validar e garantir que canvasElements seja um array
    if (!Array.isArray(stepData.canvasElements)) {
      console.error("FunnelPreview - canvasElements não é um array, corrigindo");
      // Clone o objeto para não modificar o original diretamente
      const updatedSteps = [...activeFunnel.steps];
      updatedSteps[safeStepIndex] = {
        ...stepData,
        canvasElements: []
      };
      
      // Não podemos atualizar o funil diretamente, então apenas ajustamos nossa exibição
      console.warn("FunnelPreview - Step ajustado para renderização segura");
    }
    
    // Adicionar um pequeno atraso para garantir que o DOM tenha tempo de se preparar
    const timer = setTimeout(() => {
      setDataReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [activeFunnel, activeStep]);
  
  // Reset active step when funnel changes or stepIndex changes
  useEffect(() => {
    setActiveStep(stepIndex);
  }, [funnel?.id, currentFunnel?.id, stepIndex]);

  // Determinar se deve centralizar com base no número de elementos
  useEffect(() => {
    if (!activeFunnel) return;
    
    const stepData = activeFunnel.steps[Math.min(activeStep, activeFunnel.steps.length - 1)];
    if (!stepData) return;
    
    const canvasElements = Array.isArray(stepData.canvasElements) ? stepData.canvasElements : [];
    // Se tiver muitos elementos, não centraliza (começa do topo)
    const manyElements = canvasElements.length > 3;
    setShouldCenter(centerContent && !manyElements);
  }, [activeStep, activeFunnel, centerContent]);

  // If no funnel is available, show a message
  if (!activeFunnel) {
    return <div className="text-center py-8">Funil não encontrado</div>;
  }

  // Se os dados não estiverem prontos, mostrar loading
  if (!dataReady) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 w-full max-w-md">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Make sure activeStep is within bounds of available steps
  const safeCurrentStep = Math.min(activeStep, activeFunnel.steps.length - 1);
  const stepData = activeFunnel.steps[safeCurrentStep];
  
  // If for some reason stepData is undefined, display a fallback
  if (!stepData) {
    return <div className="text-center py-8">Dados da etapa não disponíveis</div>;
  }
  
  // Usar configurações com garantia de valores padrão
  const { 
    primaryColor = "#3b82f6", 
    backgroundColor = "#ffffff", 
    logo = null 
  } = activeFunnel.settings || {};
  
  // Check if this is the last step of the funnel
  const isLastStep = safeCurrentStep === activeFunnel.steps.length - 1;

  // Custom styles based on funnel settings
  const customStyles = {
    "--primary-color": primaryColor,
    transition: 'none'
  } as React.CSSProperties;
  
  // Verificar se o logo é uma string base64 válida
  let validLogo = logo;
  if (typeof logo === 'string' && !logo.startsWith('data:image/')) {
    if (logo.startsWith('/9j/') || logo.startsWith('iVBOR')) {
      validLogo = `data:image/jpeg;base64,${logo}`;
    } else {
      validLogo = null;
    }
  }

  // Get the canvas elements from the current step
  const canvasElements = Array.isArray(stepData.canvasElements) ? stepData.canvasElements : [];

  const handleStepChange = (newStep: number) => {    
    // Validar o índice da etapa
    if (newStep < 0 || (activeFunnel && newStep >= activeFunnel.steps.length)) {
      console.error("FunnelPreview - Índice de etapa inválido:", newStep);
      return;
    }
    
    setActiveStep(newStep);
    
    // Notify parent component if callback is provided
    if (onNextStep) {
      onNextStep(newStep);
    }
  };

  // Verificar se há imagem de fundo configurada
  const hasBackgroundImage = !!activeFunnel.settings.backgroundImage;
  
  // Classes para layout responsivo
  const wrapperClass = `w-full ${isMobile ? 'mobile-view' : 'desktop-view'}`;
  const contentWrapperClass = `w-full mx-auto ${isMobile ? 'max-w-full' : 'max-w-xl'}`;
  const headerWrapperClass = "w-full flex flex-col items-center";
  const logoWrapperClass = "w-full flex justify-center mb-1";
  const progressBarClass = "w-full rounded-full overflow-hidden mb-2";
  const contentClass = `w-full`;

  return (
    <div key={renderKey} className={wrapperClass} style={customStyles}>
      {/* Facebook Pixel integration */}
      {activeFunnel.settings?.facebookPixelId && (
        <FacebookPixel 
          pixelId={activeFunnel.settings.facebookPixelId}
          trackPageView={activeFunnel.settings?.pixelTracking?.pageView !== false}
          trackRegistrationComplete={isLastStep && activeFunnel.settings?.pixelTracking?.completeRegistration !== false}
        />
      )}
      
      <div className={contentWrapperClass}>
        {/* Header Section - Logo e barra de progresso */}
        <div className={headerWrapperClass}>
          {/* Logotipo */}
          {validLogo && (
            <div className={logoWrapperClass}>
              <img 
                src={validLogo} 
                alt="Logo" 
                className="max-h-14 object-contain"
              />
            </div>
          )}

          {/* Barra de Progresso */}
          {activeFunnel.settings.showProgressBar && (
            <div 
              className={progressBarClass}
              style={{
                backgroundColor: `${primaryColor}30`,
                height: '10px'
              }}
            >
              <div 
                className="h-full"
                style={{ 
                  width: `${((safeCurrentStep + 1) / activeFunnel.steps.length) * 100}%`,
                  backgroundColor: primaryColor,
                  transition: 'width 0.2s ease-out'
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Main Content Section */}
        <div className={contentClass}>
          {canvasElements && canvasElements.length > 0 ? (
            <CanvasPreview
              canvasElements={canvasElements}
              activeStep={safeCurrentStep}
              onStepChange={handleStepChange}
              funnel={activeFunnel}
              isMobile={isMobile}
              centerContent={shouldCenter}
            />
          ) : (
            <TraditionalQuestionRenderer
              stepData={stepData}
              activeStep={safeCurrentStep}
              handleNextStep={handleStepChange}
              isLastStep={isLastStep}
              primaryColor={primaryColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FunnelPreview;
