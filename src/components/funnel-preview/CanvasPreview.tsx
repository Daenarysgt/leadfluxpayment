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
  const [allStepsReady, setAllStepsReady] = useState(false);
  
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

  // Marcar quando todas as etapas estiverem prontas para evitar o flash inicial
  useEffect(() => {
    if (allFunnelStepsElements.length > 0) {
      setAllStepsReady(true);
    }
  }, [allFunnelStepsElements]);
  
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
  
  // Se as etapas ainda não estiverem prontas, mostrar um placeholder
  if (!allStepsReady && allFunnelStepsElements.length > 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16" style={{ 
          borderRadius: '50%',
          opacity: 0.3,
          backgroundColor: 'rgba(0,0,0,0.3)'
        }}></div>
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
        position: 'relative'
      }}
    >
      {/* Renderizar todas as etapas do funil, mantendo-as no DOM */}
      {allFunnelStepsElements.length > 0 ? (
        allFunnelStepsElements.map((stepData) => (
          <div 
            key={`step-${stepData.index}-${stepData.stepId}`} 
            className={`w-full absolute top-0 left-0 right-0 transition-all duration-300 ${stepData.index === activeStep ? 'z-10 opacity-100 translate-y-0' : 'z-0 opacity-0 translate-y-4 pointer-events-none'}`}
            style={{ 
              position: 'absolute',
              width: '100%',
              height: '100%',
              padding: isMobile ? '0.25rem' : '1rem',
              overflow: 'hidden'
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
                <div key={element.id} className={`${elementClassName} fade-in-element`}>
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
        <div className={`w-full transition-all duration-300 opacity-100`}>
          {validCanvasElements.map((element, index) => {
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
              <div key={element.id} className={`${elementClassName} fade-in-element`}>
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
          })}
        </div>
      )}
      
      {/* Espaçador para garantir que o container tenha altura suficiente quando posicionamento absoluto */}
      {allFunnelStepsElements.length > 0 && (
        <div style={{ height: '500px', width: '100%' }}></div>
      )}
    </div>
  );
};

// Adicionar estilo global para o componente
const CanvasPreviewWithStyle = (props: CanvasPreviewProps) => {
  // Usar efeito para adicionar os estilos globais na montagem do componente
  useEffect(() => {
    // Criar uma tag style
    const style = document.createElement('style');
    style.innerHTML = `
      .fade-in-element {
        animation: fade-in 0.3s ease-out forwards;
      }
      
      @keyframes step-transition {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(style);
    
    // Limpar na desmontagem
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return <CanvasPreview {...props} />;
};

export default CanvasPreviewWithStyle;
