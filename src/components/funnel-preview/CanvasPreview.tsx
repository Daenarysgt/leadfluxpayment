import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CanvasElement } from "@/types/canvasTypes";
import ElementFactory from "@/components/canvas/element-renderers/ElementFactory";
import { Funnel } from '@/utils/types';
import { accessService } from '@/services/accessService';
import { FormValidationProvider, useFormValidation } from '@/utils/FormValidationContext';
import { useValidatedNavigation } from '@/hooks/useValidatedNavigation';
import { cn } from '@/lib/utils';

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
  contentMaxWidth?: number;
}

// Componente interno que usa o contexto de validação
const CanvasPreviewInner = ({ 
  canvasElements, 
  activeStep, 
  onStepChange, 
  funnel, 
  isMobile, 
  centerContent, 
  isPreviewPage, 
  className, 
  paddingLeftAdjusted, 
  paddingRightAdjusted, 
  paddingTopAdjusted, 
  paddingBottomAdjusted, 
  renderAllSteps, 
  contentMaxWidth 
}: CanvasPreviewProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shouldCenter, setShouldCenter] = useState(centerContent);
  // Referência para evitar re-renders desnecessários
  const previousStepRef = useRef<number>(activeStep);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Acessar o contexto de validação
  const { validateAndNavigate } = useFormValidation();
  
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
  
  // Função de mudança de etapa que valida campos obrigatórios usando o sistema centralizado
  const handleStepChange = useCallback((step: number) => {
    // Usar o validateAndNavigate diretamente do contexto
    validateAndNavigate(activeStep, step, onStepChange);
  }, [activeStep, onStepChange, validateAndNavigate]);
  
  // Função para próximo passo com validação
  const handleNextStep = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    const nextStep = activeStep + 1;
    if (funnel && nextStep < funnel.steps.length) {
      // Usar navegação com validação
      validateAndNavigate(activeStep, nextStep, onStepChange);
    } else {
      console.warn("CanvasPreview - Tentativa de avançar além do último passo");
    }
  }, [activeStep, funnel, onStepChange, validateAndNavigate]);
  
  // Funções de placeholder que não fazem nada no modo de visualização
  const noopFunction = () => {};
  
  // Funções de renderização dos elementos
  const renderElement = (element: CanvasElement, index?: number, totalElements?: number, stepIndex?: number) => {
    // Criar uma cópia profunda para garantir que não existam referências compartilhadas
    const elementCopy = JSON.parse(JSON.stringify(element));
    
    // Adicionar props de preview
    const elementWithPreviewProps = {
      ...elementCopy,
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
        key={`${element.id}-${index || 0}`}
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
  
  // Envolver o conteúdo no provedor de validação
  return (
    <>
      {/* Restante do código de renderização */}
      {isInPreviewMode ? (
        <div className={className || ''}>
          {validCanvasElements.map((element) => renderElement(element))}
        </div>
      ) : renderAllSteps ? (
        <div className="w-full">
          {renderAllFunnelSteps()}
        </div>
      ) : (
        <div
          className={cn(
            "canvas-preview w-full mx-auto",
            centerContent && "flex flex-col items-center",
            className
          )}
          style={{
            maxWidth: contentMaxWidth ? `${contentMaxWidth}px` : undefined,
            paddingLeft: paddingLeftAdjusted !== undefined ? `${paddingLeftAdjusted}px` : undefined,
            paddingRight: paddingRightAdjusted !== undefined ? `${paddingRightAdjusted}px` : undefined,
            paddingTop: paddingTopAdjusted !== undefined ? `${paddingTopAdjusted}px` : undefined,
            paddingBottom: paddingBottomAdjusted !== undefined ? `${paddingBottomAdjusted}px` : undefined,
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
      )}
    </>
  );
};

// Componente principal que fornece o contexto de validação
const CanvasPreview = (props: CanvasPreviewProps) => {
  return (
    <FormValidationProvider>
      <CanvasPreviewInner {...props} />
    </FormValidationProvider>
  );
};

export default CanvasPreview;
