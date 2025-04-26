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
  // Estado para controlar a direção da animação (avançar ou retroceder)
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev'>('next');
  // Referência para evitar re-renders desnecessários
  const previousStepRef = useRef<number>(activeStep);
  const transitionRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef(funnel);
  // Mantém registro de todas as etapas pré-carregadas
  const [allStepsLoaded, setAllStepsLoaded] = useState(false);
  
  // Manter funnelRef atualizado
  useEffect(() => {
    funnelRef.current = funnel;
  }, [funnel]);
  
  // Atualizar a direção da transição quando a etapa ativa mudar
  useEffect(() => {
    if (previousStepRef.current < activeStep) {
      setTransitionDirection('next');
    } else if (previousStepRef.current > activeStep) {
      setTransitionDirection('prev');
    }
    
    previousStepRef.current = activeStep;
  }, [activeStep]);
  
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
    const steps = funnel.steps.map((step, index) => {
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
    
    // Marcar que todos os steps foram carregados
    if (steps.length > 0 && !allStepsLoaded) {
      setAllStepsLoaded(true);
    }
    
    return steps;
  }, [funnel, allStepsLoaded]);
  
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
    const currentFunnel = funnelRef.current;
    if (!currentFunnel) {
      console.warn("CanvasPreview - No funnel available for navigation");
      return;
    }
    
    // Definir a direção da transição
    if (index > activeStep) {
      setTransitionDirection('next');
    } else {
      setTransitionDirection('prev');
    }
    
    // Validar se o índice é válido
    if (index < 0 || index >= currentFunnel.steps.length) {
      console.error(`CanvasPreview - Índice de etapa inválido: ${index}. Range válido: 0-${currentFunnel.steps.length - 1}`);
      return;
    }
    
    // Primeiro notificar o parent para atualizar a UI
    onStepChange(index);
    
    // Depois enviar o progresso para o servidor em segundo plano
    try {
      // Se chegou na última etapa
      if (index === currentFunnel.steps.length - 1) {
        // Apenas atualiza o progresso e marca como conversão
        accessService.updateProgress(currentFunnel.id, index + 1, sessionId, true).catch(err => {
          console.error("Error registering conversion:", err);
        });
      } else {
        // Se não for a última etapa, apenas atualiza o progresso
        accessService.updateProgress(currentFunnel.id, index + 1, sessionId).catch(err => {
          console.error("Error updating progress:", err);
        });
      }
    } catch (error) {
      console.error("CanvasPreview - Error during step interaction:", error);
    }
  }, [activeStep, sessionId, onStepChange]);
  
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
    overflowY: isMobile ? 'auto' : 'visible', // Permitir scroll vertical no mobile
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
  
  // Estilos para as animações de transição
  const getTransitionStyles = (stepIndex: number) => {
    // Verificar se é a etapa ativa
    const isActiveStep = stepIndex === activeStep;
    
    // Base styles
    const baseStyles: React.CSSProperties = {
      display: isActiveStep ? 'block' : 'none',
      opacity: isActiveStep ? 1 : 0,
      position: 'relative',
      width: '100%',
      transform: 'translate3d(0, 0, 0)', // Força o uso de GPU para animações mais suaves
      willChange: 'transform, opacity' // Dica para o navegador otimizar a animação
    };
    
    // Animation styles
    if (isActiveStep) {
      return {
        ...baseStyles,
        animation: `fadeIn${transitionDirection === 'next' ? 'Right' : 'Left'} 0.35s ease-out forwards`,
      };
    }
    
    return baseStyles;
  };
  
  // Injetar estilos CSS para as animações
  useEffect(() => {
    const styleId = 'funnel-animations';
    
    // Verificar se o estilo já existe
    if (!document.getElementById(styleId)) {
      // Criar elemento de estilo
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      
      // Definir as animações com transformações mais eficientes
      styleElement.innerHTML = `
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translate3d(5%, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translate3d(-5%, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .canvas-step-container {
          position: relative;
          width: 100%;
          transform: translate3d(0, 0, 0);
          will-change: transform, opacity;
        }
        
        .canvas-step-hidden {
          display: none !important;
          opacity: 0;
          visibility: hidden;
        }
        
        .canvas-step-visible {
          display: block !important;
          opacity: 1;
          visibility: visible;
        }
      `;
      
      // Adicionar ao documento
      document.head.appendChild(styleElement);
    }
    
    // Limpeza ao desmontar o componente
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, []);
  
  // Se todas as etapas não estiverem carregadas, mostrar indicador de carregamento
  if (!allStepsLoaded && !allFunnelStepsElements.length) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px]">
        <div className="animate-pulse w-10 h-10 rounded-full bg-gray-200"></div>
      </div>
    );
  }
  
  return (
    <div 
      ref={transitionRef}
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
        overflow: 'hidden' // Esconder overflow durante as animações
      }}
    >
      {/* Renderizar todas as etapas do funil, mas mostrar apenas a ativa */}
      {allFunnelStepsElements.length > 0 ? (
        allFunnelStepsElements.map((stepData) => (
          <div 
            key={`step-${stepData.index}-${stepData.stepId}`} 
            className={`canvas-step-container ${stepData.index === activeStep ? 'canvas-step-visible' : 'canvas-step-hidden'}`}
            style={getTransitionStyles(stepData.index)}
            aria-hidden={stepData.index !== activeStep}
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
                <div key={element.id} className={elementClassName}>
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
            <div key={element.id} className={elementClassName}>
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

const CanvasPreviewWithStyle = (props: CanvasPreviewProps) => {
  return <CanvasPreview {...props} />;
};

export default CanvasPreviewWithStyle;
