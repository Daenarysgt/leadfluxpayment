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
  
  // Estado para controlar a animação de fade
  const [fadeState, setFadeState] = useState("in"); // "in", "out", "changing"
  const [visibleStep, setVisibleStep] = useState(activeStep);
  const [preRenderedSteps, setPreRenderedSteps] = useState<number[]>([activeStep]);
  
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

  // Pré-carregar próxima etapa ao renderizar
  useEffect(() => {
    if (!funnel || !Array.isArray(funnel.steps)) return;
    
    // Adicionamos a step atual às pré-renderizadas
    const newPreRenderedSteps = [...preRenderedSteps];
    if (!newPreRenderedSteps.includes(activeStep)) {
      newPreRenderedSteps.push(activeStep);
    }
    
    // Adicionamos a próxima step para pré-renderizar
    const nextStep = activeStep + 1;
    if (nextStep < funnel.steps.length && !newPreRenderedSteps.includes(nextStep)) {
      newPreRenderedSteps.push(nextStep);
    }
    
    // Se houver uma step anterior, também adicionamos
    const prevStep = activeStep - 1;
    if (prevStep >= 0 && !newPreRenderedSteps.includes(prevStep)) {
      newPreRenderedSteps.push(prevStep);
    }
    
    setPreRenderedSteps(newPreRenderedSteps);
  }, [activeStep, funnel, preRenderedSteps]);
  
  // Efeito para gerenciar transições entre etapas com fade
  useEffect(() => {
    // Se a etapa ativa mudou, iniciar a animação de saída
    if (activeStep !== previousStepRef.current) {
      // Primeiro, garantimos que a step ativa esteja pré-renderizada
      if (!preRenderedSteps.includes(activeStep)) {
        setPreRenderedSteps(prev => [...prev, activeStep]);
      }
      
      // Iniciamos a animação de saída
      setFadeState("out");
      
      // Após a animação de saída, mudar para a nova etapa e iniciar a animação de entrada
      const timeoutId = setTimeout(() => {
        setVisibleStep(activeStep);
        setFadeState("in");
        previousStepRef.current = activeStep;
      }, 150); // Duração do fade-out reduzida para evitar piscar
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeStep, preRenderedSteps]);
  
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
    
    // Aplicar a mudança de etapa com animação de fade
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
    padding: isMobile ? '0' : '0.5rem', // Remover padding em mobile
    margin: '0',
    position: 'relative',
    left: '0',
    right: '0',
    width: '100%',
    overflowY: isMobile ? 'auto' : 'visible',
  };

  // Classes condicionais para desktop e mobile
  const containerClass = isMobile 
    ? "w-full mx-auto min-h-[300px] mobile-full-width no-spacing-mobile" 
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
        paddingBottom: isMobile ? '0' : '1rem',
        paddingTop: isMobile ? '0' : '0.5rem',
        // Garantir que a altura seja preservada durante a transição
        minWidth: '100%',
        maxWidth: '100%',
        transform: 'translate3d(0,0,0)',
        backfaceVisibility: 'hidden',
        perspective: 1000,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: shouldCenter ? 'center' : 'flex-start',
        width: '100%',
        overflowY: isMobile ? 'auto' : 'visible',
        maxHeight: isMobile ? 'none' : undefined,
      }}
    >
      {/* Renderizar todas as etapas do funil, mas mostrar apenas a ativa */}
      {allFunnelStepsElements.length > 0 ? (
        allFunnelStepsElements.map((stepData) => (
          <div 
            key={`step-${stepData.index}-${stepData.stepId}`} 
            className={`w-full step-transition-${stepData.index === visibleStep ? fadeState : 'changing'}`}
            style={{ 
              display: preRenderedSteps.includes(stepData.index) ? 'block' : 'none',
              opacity: stepData.index === visibleStep ? (fadeState === "in" ? 1 : 0) : 0,
              transition: "opacity 150ms ease-in-out",
              position: stepData.index === visibleStep ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              pointerEvents: stepData.index === visibleStep ? 'auto' : 'none',
              zIndex: stepData.index === visibleStep ? 2 : 1,
              // Eliminar margens extras que possam causar espaçamento vertical
              margin: 0,
              padding: 0
            }}
          >
            <div className="canvas-elements-container" style={{ margin: 0, padding: 0 }}>
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
                  <div 
                    key={element.id} 
                    className={`${elementClassName} canvas-element-wrapper`}
                    style={{
                      // Preservar posicionamento original do canvas
                      position: typeof element.position === 'string' && element.position === 'absolute' ? 'absolute' : 'relative',
                      // Remover margens extras
                      marginTop: element.style?.marginTop || 0,
                      marginBottom: element.style?.marginBottom || 0
                    }}
                  >
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
            <div 
              key={element.id} 
              className={`${elementClassName} canvas-element-wrapper`}
              style={{
                // Preservar posicionamento original do canvas
                position: typeof element.position === 'string' && element.position === 'absolute' ? 'absolute' : 'relative',
                // Remover margens extras
                marginTop: element.style?.marginTop || 0,
                marginBottom: element.style?.marginBottom || 0
              }}
            >
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

// Estilo para animação de fade entre etapas
const fadeInStyle = `
<style>
  .step-transition-in {
    animation: fadeIn 150ms ease-out forwards;
    will-change: opacity;
  }
  
  .step-transition-out {
    animation: fadeOut 150ms ease-in forwards;
    will-change: opacity;
  }
  
  .step-transition-changing {
    opacity: 0;
    pointer-events: none;
  }
  
  /* Corrigir espaçamento vertical */
  .canvas-container {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .canvas-elements-container {
    position: relative;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .canvas-element-wrapper {
    /* Garantir que elemento preserve seu posicionamento original */
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  
  /* Preservar espaço vertical apenas entre componentes reais */
  .canvas-element-wrapper + .canvas-element-wrapper {
    margin-top: 0.5rem;
  }
  
  /* Classe específica para mobile que remove todos os espaçamentos */
  .no-spacing-mobile * {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  
  /* Permitir apenas espaçamentos controlados em mobile */
  @media (max-width: 768px) {
    .canvas-element-wrapper + .canvas-element-wrapper {
      margin-top: 6px !important;
    }
    
    /* Redefine o tamanho dos elementos para corresponder ao design original */
    .canvas-element, .canvas-element-mobile {
      min-height: auto !important;
      height: auto !important;
    }
    
    /* Ajuste específico para componentes de imagem */
    .option-card, .multiple-choice-image-grid {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Ajuste para grids de elementos */
    .grid-cols-2 {
      gap: 8px !important;
    }
  }
</style>
`;

const CanvasPreviewWithStyle = (props: CanvasPreviewProps) => {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: fadeInStyle }} />
      <CanvasPreview {...props} />
    </>
  );
};

export default CanvasPreviewWithStyle;
