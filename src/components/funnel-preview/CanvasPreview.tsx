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
  isPreviewPage?: boolean;
  className?: string;
  paddingLeftAdjusted?: number;
  paddingRightAdjusted?: number;
  paddingTopAdjusted?: number;
  paddingBottomAdjusted?: number;
  renderAllSteps?: boolean;
}

const CanvasPreview = ({ canvasElements = [], activeStep = 0, onStepChange, funnel, isMobile = false, centerContent = false, isPreviewPage = false, className, paddingLeftAdjusted, paddingRightAdjusted, paddingTopAdjusted, paddingBottomAdjusted, renderAllSteps = false }: CanvasPreviewProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shouldCenter, setShouldCenter] = useState(centerContent);
  // Referência para evitar re-renders desnecessários
  const previousStepRef = useRef<number>(activeStep);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Detectar se estamos na página de preview
  // Tanto pela prop explícita quanto pela URL
  const isInPreviewMode = isPreviewPage || window.location.pathname.includes('/preview/');
  
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
  
  // Funções de renderização dos elementos
  const renderElement = (element: CanvasElement, index?: number, totalElements?: number, stepIndex?: number) => {
    // Adicionar props de preview
    const elementWithPreviewProps = {
      ...element,
      previewMode: true,
      previewProps: {
        activeStep: stepIndex !== undefined ? stepIndex : activeStep,
        onStepChange: handleStepChange,
        funnel,
        isMobile
      },
      skipLoading: true
    };

    return (
      <ElementFactory
        key={element.id}
        element={elementWithPreviewProps}
        isSelected={false}
        isDragging={false}
        onSelect={noopFunction}
        onRemove={noopFunction}
        index={index || 0}
        totalElements={totalElements || 0}
        onDragStart={null}
        onDragEnd={null}
      />
    );
  };

  // Renderizar todas as etapas do funil
  const renderAllFunnelSteps = () => {
    if (!funnel || !Array.isArray(funnel.steps)) {
      return null;
    }

    return (
      <>
        {allFunnelStepsElements.map((stepInfo, stepIndex) => (
          <div 
            key={`step-${stepInfo.stepId || stepIndex}`}
            className="w-full mb-12 pb-6 border-b border-gray-200"
            id={`funnel-step-${stepIndex}`}
          >
            <div className="w-full text-center mb-4">
              <h2 className="text-xl font-bold">Etapa {stepIndex + 1}</h2>
              <div className="h-1 w-16 bg-primary mx-auto mt-2 rounded-full"></div>
            </div>
            
            {stepInfo.elements.map((element, index) => (
              <div
                key={element.id}
                style={{
                  marginBottom: '0.5rem',
                  width: '100%',
                }}
              >
                {renderElement(element, index, stepInfo.elements.length, stepIndex)}
              </div>
            ))}
            
            {stepIndex < allFunnelStepsElements.length - 1 && (
              <div className="w-full flex justify-center mt-6">
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark"
                  onClick={() => handleStepChange(stepIndex + 1)}
                >
                  Ir para próxima etapa
                </button>
              </div>
            )}
          </div>
        ))}
      </>
    );
  };
  
  // No modo preview, usar absolutamente nenhuma classe ou estilo além do que foi explicitamente passado
  if (isInPreviewMode) {
    return (
      <div className={className || ''}>
        {validCanvasElements.map((element) => renderElement(element))}
      </div>
    );
  }

  // Renderizar todas as etapas se a opção estiver ativada
  if (renderAllSteps && funnel) {
    return (
      <div 
        className={`w-full h-full overflow-y-auto ${className || ''}`}
        ref={canvasRef}
        style={{
          backgroundColor: 'transparent',
          borderRadius: isMobile ? '0' : '0.5rem',
          padding: isMobile ? '0.25rem' : '1rem',
          margin: isMobile ? '0 auto' : '0 auto',
          position: 'relative',
          width: isMobile ? '100%' : 'auto',
          overflowY: 'auto',
          paddingLeft: paddingLeftAdjusted,
          paddingRight: paddingRightAdjusted,
          paddingTop: paddingTopAdjusted,
          paddingBottom: paddingBottomAdjusted
        }}
      >
        {renderAllFunnelSteps()}
      </div>
    );
  }
  
  // Modo normal (builder): manter estrutura original com wrappers e estilos
  return (
    <div
      className={`w-full h-full overflow-y-auto ${className || ''}`}
      ref={canvasRef}
      style={{
        backgroundColor: 'transparent',
        borderRadius: isMobile ? '0' : '0.5rem',
        padding: isMobile ? '0.25rem' : '1rem',
        margin: isMobile ? '0 auto' : '0 auto',
        position: 'relative',
        width: isMobile ? '100%' : 'auto',
        overflowY: isMobile ? 'auto' : 'visible',
        paddingLeft: paddingLeftAdjusted,
        paddingRight: paddingRightAdjusted,
        paddingTop: paddingTopAdjusted,
        paddingBottom: paddingBottomAdjusted
      }}
    >
      {validCanvasElements.map((element, index) => (
        <div
          key={element.id}
          style={{
            marginBottom: '0.5rem',
            width: '100%',
          }}
        >
          {renderElement(element, index, validCanvasElements.length)}
        </div>
      ))}
    </div>
  );
};

export default CanvasPreview;
