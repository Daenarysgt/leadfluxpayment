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
  
  // Estados para controlar transição com fade
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeDirection, setFadeDirection] = useState("in");
  
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
      console.log("FunnelPreview - Dados prontos para renderização");
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeFunnel, activeStep]);
  
  // Reset active step when funnel changes or stepIndex changes
  useEffect(() => {
    // Quando o stepIndex muda externamente, aplicar transição simples sem fade
    if (activeStep !== stepIndex) {
      setActiveStep(stepIndex);
    }
  }, [funnel?.id, currentFunnel?.id, stepIndex, activeStep]);

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

  // Melhoria específica para mobile - remover espaçamentos desnecessários
  useEffect(() => {
    if (isMobile) {
      // Adicionar classe ao corpo para remover espaçamentos
      document.body.classList.add('mobile-preview-active');
      
      // Cleanup ao desmontar
      return () => {
        document.body.classList.remove('mobile-preview-active');
      };
    }
  }, [isMobile]);

  // If no funnel is available, show a message
  if (!activeFunnel) {
    return <div className="text-center py-8">Funil não encontrado</div>;
  }

  // Se os dados não estiverem prontos, mostrar loading
  if (!dataReady) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[300px]">
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
    // Remover transição do componente pai para evitar efeito de duplo fade
    transition: 'none',
    opacity: 1
  } as React.CSSProperties;

  // Debug log para verificar se o logo está chegando
  console.log("FunnelPreview - Logo encontrado nas settings:", !!logo, typeof logo);
  
  // Verificar se o logo é uma string base64 válida
  let validLogo = logo;
  if (typeof logo === 'string' && !logo.startsWith('data:image/')) {
    console.error("FunnelPreview - Logo não é uma string base64 válida");
    // Tentar corrigir formatos comuns de base64 sem o prefixo
    if (logo.startsWith('/9j/') || logo.startsWith('iVBOR')) {
      console.log("FunnelPreview - Tentando corrigir formato do logo");
      validLogo = `data:image/jpeg;base64,${logo}`;
    } else {
      validLogo = null;
    }
  }

  // Get the canvas elements from the current step's questions and garantir que seja array válido
  const canvasElements = Array.isArray(stepData.canvasElements) ? stepData.canvasElements : [];

  const handleStepChange = (newStep: number) => {
    console.log("FunnelPreview - Changing step to:", newStep);
    
    // Validar o índice da etapa
    if (newStep < 0 || (activeFunnel && newStep >= activeFunnel.steps.length)) {
      console.error("FunnelPreview - Índice de etapa inválido:", newStep);
      return;
    }
    
    // Apenas passar a mudança de etapa para o componente filho
    setActiveStep(newStep);
    
    // Notify parent component if callback is provided
    if (onNextStep) {
      onNextStep(newStep);
    }
  };

  // Verificar se há imagem de fundo configurada para ajustar a visualização
  const hasBackgroundImage = !!activeFunnel.settings.backgroundImage;
  const useBackgroundOpacity = hasBackgroundImage && typeof activeFunnel.settings.backgroundOpacity === 'number';
  const contentStyle = 'transparent'; // Força estilo sempre como transparent
  
  // Melhorar estilos para prevenção de layout shifts
  const responsiveClass = isMobile ? 'mobile-view' : 'desktop-view';
  
  // Altura estimada do header (logo + barra de progresso + paddings)
  const headerHeight = 80; // ajustável baseado na altura real do header
  
  // Classes melhoradas para responsividade
  const wrapperClass = `w-full ${responsiveClass} ${centerContent ? 'h-[100dvh] flex flex-col' : ''}`;
  
  // Wrapper para todo o conteúdo - remover padding em mobile
  const contentWrapperClass = `flex flex-col w-full mx-auto ${isMobile ? 'max-w-full p-0' : 'max-w-xl'}`;
  
  // Wrapper apenas para o logo e barra de progresso - minimizar em mobile
  const headerWrapperClass = isMobile
    ? "w-full flex flex-col items-center py-0 px-0"
    : "w-full flex flex-col items-center py-1 px-2 sm:py-2 sm:px-0";
  
  // Wrapper para o conteúdo principal - minimizar em mobile
  const mainContentWrapperClass = isMobile
    ? "w-full flex flex-col items-center p-0 m-0"
    : (shouldCenter 
      ? "w-full flex-1 flex flex-col items-center justify-center py-1 px-2 sm:py-2 sm:px-0" 
      : "w-full flex flex-col items-center py-1 px-2 sm:py-2 sm:px-0");
  
  const logoWrapperClass = isMobile ? "w-full flex justify-center py-0 m-0" : "w-full flex justify-center py-1 mb-1";
  const progressBarClass = isMobile ? "w-full rounded-full overflow-hidden mb-0" : "w-full rounded-full overflow-hidden mb-1 sm:mb-2";
  const contentClass = `w-full ${responsiveClass} preview-content ${isMobile ? 'mobile-content-fix' : ''}`;

  // Estilos específicos para o tipo de dispositivo e centralização
  const mainContainerStyle: React.CSSProperties = {
    transition: 'all 0.4s ease',
    width: isMobile ? '100%' : 'auto',
    maxWidth: isMobile ? '100%' : 'auto',
    overflow: isMobile ? 'visible' : 'hidden', // Permitir overflow no mobile
    padding: 0,
    margin: 0
  };
  
  // Estilo do contêiner principal quando centralizado
  const centerContentStyle: React.CSSProperties = shouldCenter ? {
    minHeight: `calc(100dvh - ${headerHeight}px)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflowY: isMobile ? 'auto' : 'visible', // Permitir scroll no mobile
    padding: 0,
    margin: 0
  } : {
    // Estilo quando não está centralizado
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflowY: isMobile ? 'auto' : 'visible',
    padding: 0,
    margin: 0
  };

  return (
    <div 
      key={renderKey} 
      className={`${wrapperClass} ${isMobile ? 'mobile-preview-fix' : ''}`} 
      style={{
        ...customStyles, 
        overflowY: isMobile ? 'auto' : 'visible'
      }}
    >
      {/* Facebook Pixel integration */}
      {activeFunnel.settings?.facebookPixelId && (
        <FacebookPixel 
          pixelId={activeFunnel.settings.facebookPixelId}
          trackPageView={activeFunnel.settings?.pixelTracking?.pageView !== false}
          trackRegistrationComplete={isLastStep && activeFunnel.settings?.pixelTracking?.completeRegistration !== false}
        />
      )}
      
      <div className={contentWrapperClass} style={isMobile ? {overflowY: 'auto'} : {}}>
        {/* Header Section - Logo e barra de progresso */}
        <div className={headerWrapperClass}>
          {/* Logotipo */}
          {validLogo && (
            <div className={logoWrapperClass}>
              <img 
                src={validLogo} 
                alt="Logo" 
                className="max-h-14 object-contain"
                onError={(e) => {
                  console.error("FunnelPreview - Erro ao carregar logo:", e);
                  // Esconder o elemento em caso de erro
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log("FunnelPreview - Logo carregado com sucesso");
                }}
              />
            </div>
          )}

          {/* Barra de Progresso */}
          {activeFunnel.settings.showProgressBar && (
            <div 
              className={progressBarClass}
              style={{
                backgroundColor: `${primaryColor}30`, // Usando a mesma cor com 30% de opacidade
                height: '10px' // Valor intermediário entre h-2 (8px) e h-3 (12px)
              }}
            >
              <div 
                className="h-full"
                style={{ 
                  width: `${((safeCurrentStep + 1) / activeFunnel.steps.length) * 100}%`,
                  backgroundColor: primaryColor,
                  transition: 'width 0.2s ease-out' // Manter apenas a transição na barra de progresso
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Main Content Section - Centralizado verticalmente quando centerContent=true */}
        <div className={mainContentWrapperClass} style={{...centerContentStyle, overflowY: isMobile ? 'auto' : 'visible', padding: 0, margin: 0}}>
          <div className={contentClass} style={{...mainContainerStyle, padding: 0, margin: 0}}>
            {canvasElements && canvasElements.length > 0 ? (
              <div className="w-full compact-preview" style={{padding: 0, margin: 0, overflowY: isMobile ? 'auto' : 'visible'}}>
                <CanvasPreview
                  canvasElements={canvasElements}
                  activeStep={safeCurrentStep}
                  onStepChange={handleStepChange}
                  funnel={activeFunnel}
                  isMobile={isMobile}
                  centerContent={shouldCenter}
                />
              </div>
            ) : (
              // Otherwise, fall back to the traditional question rendering
              <div>
                  <TraditionalQuestionRenderer
                    stepData={stepData}
                    activeStep={safeCurrentStep}
                    handleNextStep={handleStepChange}
                    isLastStep={isLastStep}
                    primaryColor={primaryColor}
                  />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelPreview;
