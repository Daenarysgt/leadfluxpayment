import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CanvasElement } from "@/types/canvasTypes";
import ElementFactory from "@/components/canvas/element-renderers/ElementFactory";
import { Funnel } from '@/utils/types';
import { accessService } from '@/services/accessService';

interface CanvasPreviewProps {
  canvasElements: CanvasElement[];
  activeStep: number;
  onStepChange: (newStep: number) => void;
  funnel?: Funnel;
  isMobile?: boolean;
  centerContent?: boolean;
}

const CanvasPreview = ({ canvasElements = [], activeStep = 0, onStepChange, funnel, isMobile = false, centerContent = false }: CanvasPreviewProps) => {
  console.log("CanvasPreview - Rendering with", Array.isArray(canvasElements) ? canvasElements.length : 0, "elements", isMobile ? "on mobile" : "on desktop");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shouldCenter, setShouldCenter] = useState(centerContent);
  const [elementsReady, setElementsReady] = useState(false);
  const [renderAttempt, setRenderAttempt] = useState(0);
  const [renderKey] = useState(`canvas-${Date.now()}`);
  
  // Usar elementos válidos
  const validCanvasElements = useMemo(() => {
    // Garantir que canvasElements é um array
    if (!Array.isArray(canvasElements)) {
      console.error("CanvasPreview - canvasElements não é um array:", canvasElements);
      return [];
    }
    
    // Filtrar elementos inválidos
    return canvasElements.filter(element => 
      element && 
      typeof element === 'object' && 
      element.id && 
      element.type
    );
  }, [canvasElements]);
  
  // Verificar se todos os elementos estão carregados de forma adequada
  useEffect(() => {
    // Garantir que temos elementos válidos
    if (validCanvasElements.length === 0 && canvasElements.length > 0) {
      console.warn("CanvasPreview - Elementos inválidos foram filtrados");
    }
    
    // Um pequeno atraso para garantir que o DOM esteja pronto
    const timer = setTimeout(() => {
      setElementsReady(true);
      console.log("CanvasPreview - Elementos prontos para renderização");
    }, 50);
    
    return () => clearTimeout(timer);
  }, [validCanvasElements, canvasElements.length]);
  
  // Determinar se deve centralizar com base no número de elementos
  useEffect(() => {
    // Se tiver muitos elementos, não centraliza (começa do topo)
    const manyElements = validCanvasElements.length > 3;
    setShouldCenter(centerContent && !manyElements);
  }, [validCanvasElements.length, centerContent]);
  
  // Inicializar sessão somente uma vez
  useEffect(() => {
    const initSession = async () => {
      if (funnel && !sessionId) {
        try {
          const newSessionId = await accessService.logAccess(funnel.id);
          setSessionId(newSessionId);
          console.log("CanvasPreview - Sessão inicializada:", newSessionId);
        } catch (error) {
          console.error("CanvasPreview - Erro ao inicializar sessão:", error);
        }
      }
    };
    
    initSession();
  }, [funnel, sessionId]);
  
  // Handler para mudança de etapa com verificação de segurança
  const handleStepChange = useCallback(async (index: number) => {
    console.log("CanvasPreview - handleStepChange called com índice:", index);
    
    if (!funnel) {
      console.warn("CanvasPreview - No funnel available for navigation");
      return;
    }
    
    // Validar se o índice é válido
    if (index < 0 || index >= funnel.steps.length) {
      console.error(`CanvasPreview - Índice de etapa inválido: ${index}. Range válido: 0-${funnel.steps.length - 1}`);
      return;
    }
    
    console.log(`CanvasPreview - Navegando da etapa ${activeStep} para etapa ${index}`);
    
    try {
      // Se chegou na última etapa
      if (index === funnel.steps.length - 1) {
        // Apenas atualiza o progresso e marca como conversão
        await accessService.updateProgress(funnel.id, index + 1, sessionId, true);
      } else {
        // Se não for a última etapa, apenas atualiza o progresso
        await accessService.updateProgress(funnel.id, index + 1, sessionId);
      }
    } catch (error) {
      console.error("CanvasPreview - Error during step interaction:", error);
      // Continue com a navegação mesmo com erro de registro
    }
    
    console.log("CanvasPreview - Changing step to:", index);
    
    // Aplicar a mudança de etapa diretamente
    onStepChange(index);
  }, [funnel, activeStep, sessionId, onStepChange]);
  
  // Detectar propriedades visuais do funnel com valores padrão seguros
  const hasBackgroundImage = !!(funnel?.settings?.backgroundImage);
  const hasBackgroundOpacity = hasBackgroundImage && typeof funnel?.settings?.backgroundOpacity === 'number';
  
  // Estilos de container com valores padrão seguros
  const containerStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: hasBackgroundImage ? 'white' : 'inherit',
    transition: 'all 0.5s ease',
    borderRadius: isMobile ? '0' : '0.5rem',
    padding: isMobile ? '0.25rem' : '1rem',
    margin: isMobile ? '0 auto' : '0 auto',
    position: 'relative',
    left: isMobile ? '0' : 'auto',
    right: isMobile ? '0' : 'auto',
    width: isMobile ? '100%' : 'auto',
    overflowY: isMobile ? 'auto' : 'visible', // Permitir scroll vertical no mobile
  };

  // Classes condicionais para desktop e mobile
  const containerClass = isMobile 
    ? "w-full mx-auto min-h-[300px] mobile-full-width" 
    : "w-full mx-auto min-h-[300px] rounded-lg";
  
  // Função para próximo passo
  const handleNextStep = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    console.log('Botão clicado em CanvasPreview. Avançando para próximo passo.');
    
    const nextStep = activeStep + 1;
    if (funnel && nextStep < funnel.steps.length) {
      console.log(`Alterando para o passo ${nextStep}`);
      onStepChange(nextStep);
    } else {
      console.warn("CanvasPreview - Tentativa de avançar além do último passo");
    }
  }, [activeStep, funnel, onStepChange]);
  
  // Tentar novamente se a renderização falhar
  useEffect(() => {
    if (!elementsReady && renderAttempt < 3) {
      const retryTimer = setTimeout(() => {
        console.log("CanvasPreview - Tentando renderizar novamente...", renderAttempt + 1);
        setRenderAttempt(prev => prev + 1);
        setElementsReady(true);
      }, 300 * (renderAttempt + 1));
      
      return () => clearTimeout(retryTimer);
    }
  }, [elementsReady, renderAttempt]);
  
  // Se os elementos não estiverem prontos, mostrar um loading simples
  if (!elementsReady) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[300px]">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se depois de várias tentativas não tivermos elementos válidos, mostrar mensagem de erro
  if (validCanvasElements.length === 0 && renderAttempt >= 3) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-2">Não foi possível carregar o conteúdo</p>
        <button 
          onClick={() => {
            setRenderAttempt(0);
            setElementsReady(false);
          }}
          className="text-sm text-blue-500 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  return (
    <div 
      key={renderKey}
      className={`${containerClass} canvas-container w-full`}
      style={{
        ...containerStyles,
        minHeight: 'max-content',
        paddingBottom: '1.5rem',
        paddingTop: '0.5rem',
        // Garantir que a altura seja preservada durante a transição
        minWidth: isMobile ? '100%' : 'auto',
        maxWidth: isMobile ? '100%' : 'auto',
        transform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: shouldCenter ? 'center' : 'flex-start',
        width: '100%',
        overflowY: isMobile ? 'auto' : 'visible', // Garantir scroll no mobile
        maxHeight: isMobile ? 'none' : undefined, // Remover limite de altura no mobile
      }}
    >
      {validCanvasElements.map((element, index) => {
        // Evitar log excessivo em produção
        if (process.env.NODE_ENV !== 'production') {
          console.log("CanvasPreview - Processing element:", element.id, element.type);
        }
        
        // Manter elementos com o mesmo estilo do desktop
        const adjustedElement = { ...element };
        
        // Add preview properties to the element for navigation
        const elementWithPreviewProps = {
          ...adjustedElement,
          previewMode: true,
          previewProps: {
            activeStep,
            onStepChange: handleStepChange,
            funnel,
            isMobile,
          }
        };
        
        // Classe específica para mobile ou desktop
        const elementWrapperClass = `w-full ${isMobile ? 'mobile-element' : 'desktop-element'}`;
        
        // Estilos específicos para tipo de dispositivo
        const elementWrapperStyle: React.CSSProperties = isMobile 
          ? { maxWidth: '100%', overflow: 'hidden' } 
          : {};
        
        // Cada elemento com uma key única e estável
        const elementKey = `element-${element.id}-${index}`;
        
        return (
          <div 
            key={elementKey}
            className={elementWrapperClass}
            style={elementWrapperStyle}
          >
            <ElementFactory 
              element={elementWithPreviewProps}
              onSelect={() => {}} 
              isSelected={false} 
              isDragging={false}
              onRemove={() => {}}
              index={index}
              totalElements={validCanvasElements.length}
              // Pass null for drag functions to disable drag in preview
              onDragStart={null}
              onDragEnd={null}
            />
          </div>
        );
      })}
      
      {/* Estilo global para transições suaves */}
      <style dangerouslySetInnerHTML={{__html: `
        .canvas-container {
          will-change: contents;
          transform: translateZ(0);
        }
        .mobile-element, .desktop-element {
          transition: opacity 0.3s ease, transform 0.3s ease;
          will-change: transform, opacity;
        }
        .mobile-view, .desktop-view {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}} />
    </div>
  );
};

export default CanvasPreview;
