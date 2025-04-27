import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shouldCenter, setShouldCenter] = useState(centerContent);
  // Referência para evitar re-renders desnecessários
  const previousStepRef = useRef<number>(activeStep);
  const transitionRef = useRef<HTMLDivElement>(null);
  
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
  
  // Pré-renderizar todas as etapas do funil
  const allFunnelStepsElements = useMemo(() => {
    if (!funnel || !Array.isArray(funnel.steps)) {
      return [];
    }
    
    // Mapear todas as etapas e seus elementos de canvas
    return funnel.steps.map((step, index) => {
      const stepElements = Array.isArray(step.canvasElements) 
        ? step.canvasElements.filter(element => 
            element && 
            typeof element === 'object' && 
            element.id && 
            element.type
          )
        : [];
      
      return {
        index,
        elements: stepElements,
        stepId: step.id
      };
    });
  }, [funnel]);
  
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
        } catch (error) {
          console.error("CanvasPreview - Erro ao inicializar sessão:", error);
        }
      }
    };
    
    initSession();
  }, [funnel, sessionId]);
  
  // Handler para mudança de etapa com verificação de segurança
  const handleStepChange = useCallback(async (index: number) => {
    if (!funnel) {
      console.warn("CanvasPreview - No funnel available for navigation");
      return;
    }
    
    // Validar se o índice é válido
    if (index < 0 || index >= funnel.steps.length) {
      console.error(`CanvasPreview - Índice de etapa inválido: ${index}. Range válido: 0-${funnel.steps.length - 1}`);
      return;
    }
    
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
    
    // Aplicar a mudança de etapa diretamente
    onStepChange(index);
  }, [funnel, sessionId, onStepChange]);
  
  // Detectar propriedades visuais do funnel com valores padrão seguros
  const hasBackgroundImage = !!(funnel?.settings?.backgroundImage);
  const hasBackgroundOpacity = hasBackgroundImage && typeof funnel?.settings?.backgroundOpacity === 'number';
  
  // Estilos de container com valores padrão seguros
  const containerStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: hasBackgroundImage ? 'white' : 'inherit',
    borderRadius: isMobile ? '0' : '0.5rem',
    padding: isMobile ? '0.25rem' : '1rem',
    margin: isMobile ? '0 auto' : '0 auto',
    position: 'relative',
    left: isMobile ? '0' : 'auto',
    right: isMobile ? '0' : 'auto',
    width: isMobile ? '100%' : 'auto',
    overflowY: 'visible', // Sempre usar visible para evitar scrolls duplicados
  };

  // Classes condicionais para desktop e mobile
  const containerClass = isMobile 
    ? "w-full mx-auto min-h-[300px] mobile-full-width" 
    : "w-full mx-auto min-h-[300px] rounded-lg";
  
  // Função para próximo passo
  const handleNextStep = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    const nextStep = activeStep + 1;
    if (funnel && nextStep < funnel.steps.length) {
      onStepChange(nextStep);
    } else {
      console.warn("CanvasPreview - Tentativa de avançar além do último passo");
    }
  }, [activeStep, funnel, onStepChange]);
  
  // Funções de placeholder que não fazem nada no modo de visualização
  const noopFunction = () => {};
  
  return (
    <div 
      ref={transitionRef}
      className={`${containerClass} canvas-container w-full`}
      style={{
        ...containerStyles,
        minHeight: 'max-content',
        paddingBottom: '1rem',
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
        overflowY: 'visible', // Sempre usar visible para evitar scrolls duplicados
        maxHeight: 'none', // Remover limite de altura para todos os modos
        // Remover qualquer animação de fade-in
        opacity: 1,
        transition: 'none'
      }}
    >
      {/* Renderizar todas as etapas do funil, mas mostrar apenas a ativa */}
      {allFunnelStepsElements.length > 0 ? (
        allFunnelStepsElements.map((stepData) => (
          <div 
            key={`step-${stepData.index}-${stepData.stepId}`} 
            className="w-full transition-opacity duration-100" 
            style={{ 
              display: stepData.index === activeStep ? 'block' : 'none',
              opacity: 1 // Manter opacidade 1 para evitar efeito de fade
            }}
          >
            {stepData.elements.map((element, elementIndex) => {
              // Adicionar propriedades de preview para navegação
              const elementWithPreviewProps = {
                ...element,
                previewMode: true,
                previewProps: {
                  activeStep,
                  onStepChange: handleStepChange,
                  funnel,
                  isMobile,
                },
                // Adicionar flag para evitar loading states
                skipLoading: true
              };
              
              // Classe específica para mobile ou desktop
              const elementClassName = isMobile ? 'canvas-element-mobile' : 'canvas-element';
              
              return (
                <div key={element.id} className={elementClassName} style={{ opacity: 1 }}>
                  <ElementFactory 
                    element={elementWithPreviewProps}
                    isSelected={false} 
                    isDragging={false}
                    onSelect={noopFunction}
                    onRemove={noopFunction}
                    index={elementIndex}
                    totalElements={stepData.elements.length}
                    onDragStart={null}
                    onDragEnd={null}
                  />
                </div>
              );
            })}
          </div>
        ))
      ) : (
        // Caso fallback para usar os elementos passados diretamente como prop
        validCanvasElements.map((element, index) => {
          const elementWithPreviewProps = {
            ...element,
            previewMode: true,
            previewProps: {
              activeStep,
              onStepChange: handleStepChange,
              funnel,
              isMobile,
            },
            skipLoading: true
          };
          
          const elementClassName = isMobile ? 'canvas-element-mobile' : 'canvas-element';
          
          return (
            <div key={element.id} className={elementClassName} style={{ opacity: 1 }}>
              <ElementFactory 
                element={elementWithPreviewProps}
                isSelected={false} 
                isDragging={false}
                onSelect={noopFunction}
                onRemove={noopFunction}
                index={index}
                totalElements={validCanvasElements.length}
                onDragStart={null}
                onDragEnd={null}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

// Removemos o estilo de animação fade-in
const fadeInStyle = `
<style>
  /* Estilos removidos para evitar qualquer animação de fade */
</style>
`;

const CanvasPreviewWithStyle = (props: CanvasPreviewProps) => {
  return (
    <>
      {/* Remover a injeção de estilos de animação */}
      <CanvasPreview {...props} />
    </>
  );
};

export default CanvasPreviewWithStyle;
