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
  // Manter um registro de todas as etapas já visualizadas para evitar re-renders
  const [renderedSteps, setRenderedSteps] = useState<Record<number, boolean>>({});
  const previousStepRef = useRef<number>(activeStep);
  const transitionRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Marcar todas as etapas como pré-renderizadas para evitar skeleton em transições
  useEffect(() => {
    if (!funnel || !Array.isArray(funnel.steps)) return;
    
    // Inicializar todas as etapas como já visualizadas
    const allStepsRendered = funnel.steps.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {} as Record<number, boolean>);
    
    setRenderedSteps(allStepsRendered);
  }, [funnel]);
  
  // Adicionar transição suave quando a etapa muda
  useEffect(() => {
    // Só realizar a transição se não for a primeira renderização
    if (previousStepRef.current !== activeStep && transitionRef.current) {
      // Iniciar a transição
      setIsTransitioning(true);
      const container = transitionRef.current;
      
      // Reset e início da animação
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';
      
      // Forçar reflow para iniciar a animação
      void container.offsetWidth;
      
      // Iniciar transição
      container.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
      
      // Limpar estado de transição após a animação
      const transitionEnd = () => {
        setIsTransitioning(false);
        container.removeEventListener('transitionend', transitionEnd);
      };
      
      container.addEventListener('transitionend', transitionEnd);
      
      // Limpar evento se o componente for desmontado durante a transição
      return () => {
        container.removeEventListener('transitionend', transitionEnd);
      };
    }
    
    // Atualizar referência da etapa atual
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
    willChange: 'transform, opacity', // Melhorar performance de animação
    opacity: 1, // Iniciar visível mas será animado na troca de etapas
    transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
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
        // Aplicar aceleração de hardware para animações
        WebkitTransformStyle: 'preserve-3d',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      {validCanvasElements.map((element, index) => {
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
          },
          // Adicionar flag para evitar loading states
          skipLoading: true
        };
        
        // Classe específica para mobile ou desktop
        const elementClassName = isMobile ? 'canvas-element-mobile' : 'canvas-element';
        
        return (
          <div 
            key={element.id} 
            className={elementClassName} 
            style={{ 
              opacity: 1,
              transition: 'opacity 0.3s ease-out',
              willChange: 'opacity',
              WebkitTransformStyle: 'preserve-3d'
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
      })}
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
