import React, { useEffect, useState } from 'react';
import FunnelPreview from "@/components/FunnelPreview"; // Importação direta do componente principal
import { useStore } from "@/utils/store";
import { Funnel } from '@/utils/types';
import { CanvasElement } from '@/types/canvasTypes';
import { useBuilderCanvas } from '@/hooks/useBuilderCanvas';

const BuilderPreview = React.memo(({ isMobile }: { isMobile: boolean }) => {
  const { currentFunnel, currentStep } = useStore();
  // Acessar os elementos do canvas diretamente do hook
  const { localCanvasElements, canvasKey } = useBuilderCanvas();
  // Estado para rastrear se o preview está pronto para renderizar
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  
  // Criar um estado local para o funnel clonado para evitar problemas de referência
  const [clonedFunnel, setClonedFunnel] = useState<Funnel | null>(null);
  // Chave única para forçar re-renderizações
  const [renderKey, setRenderKey] = useState(Date.now());
  
  // Função para ajustar os elementos para renderização mais próxima da pré-visualização
  // Similar à usada no BuilderCanvas para garantir consistência
  const adjustElementsForConsistentDisplay = (elementsToAdjust: CanvasElement[]): CanvasElement[] => {
    if (!Array.isArray(elementsToAdjust)) return [];
    
    // Clone os elementos para não modificar o original
    const adjustedElements = [...elementsToAdjust];
    
    // Primeiro, ordenamos os elementos por posição vertical (y)
    const sortedElements = adjustedElements.sort((a, b) => {
      const posA = a.position?.y || 0;
      const posB = b.position?.y || 0;
      return posA - posB;
    });
    
    // Depois, ajustamos os espaçamentos entre eles
    let lastBottomPosition = 0;
    const VERTICAL_GAP = 10; // Espaçamento vertical padrão entre elementos
    
    return sortedElements.map((element: CanvasElement) => {
      const adjustedElement = { ...element };
      
      // Para dispositivos móveis, modificar as posições e dimensões
      if (isMobile) {
        // Assegurar que elementos com position tenham left=0 para evitar deslocamento
        if (adjustedElement.position) {
          adjustedElement.position = {
            ...adjustedElement.position,
            x: 0 // Forçar alinhamento à esquerda
          };
        }
        
        // Assegurar largura máxima para caber na tela
        if (adjustedElement.dimensions) {
          adjustedElement.dimensions = {
            ...adjustedElement.dimensions,
            width: Math.min(adjustedElement.dimensions.width, window.innerWidth - 32) // Limitar largura
          };
        }
      }
      
      // Corrigir espaçamentos verticais excessivos
      if (adjustedElement.position) {
        // Se não for o primeiro elemento e tiver um espaçamento muito grande
        if (lastBottomPosition > 0) {
          // O elemento deve estar pelo menos a uma distância mínima do anterior
          const minY = lastBottomPosition + VERTICAL_GAP;
          
          // Se a posição atual for muito maior que a posição mínima, ajustamos
          if (adjustedElement.position.y > minY + 100) { // 100px é o limite para considerar como "espaço excessivo"
            adjustedElement.position = {
              ...adjustedElement.position,
              y: minY // Reduzir o espaçamento vertical
            };
          }
        }
        
        // Calcular a posição inferior deste elemento para o próximo
        const height = adjustedElement.dimensions?.height || 0;
        lastBottomPosition = adjustedElement.position.y + height;
      }
      
      return adjustedElement;
    });
  };
  
  // Log para debug
  console.log(`BuilderPreview - Canvas Key: ${canvasKey}, Elements: ${localCanvasElements?.length || 0}`);

  // Efeito para clonar o funnel corretamente quando ele ou a etapa mudar
  useEffect(() => {
    if (!currentFunnel) {
      setIsPreviewReady(false);
      return;
    }
    
    console.log("BuilderPreview - Preparando dados para preview");
    
    // Criar uma nova chave de renderização para garantir re-renderização completa
    setRenderKey(Date.now());
    
    // Clonar funnel de forma estruturada para garantir que todos os dados sejam preservados
    try {
      // Clonagem estruturada para preservar propriedades importantes
      const clonedFunnelData = {
        ...currentFunnel,
        steps: currentFunnel.steps.map((step, stepIndex) => {
          // Se for o step atual, usar os elementos locais do canvas (mais atualizados)
          // caso contrário, usar os elementos do step normalmente
          let canvasElements: CanvasElement[] = [];
          
          if (stepIndex === currentStep && localCanvasElements && localCanvasElements.length > 0) {
            console.log(`BuilderPreview - Usando ${localCanvasElements.length} elementos locais para o step atual`);
            canvasElements = adjustElementsForConsistentDisplay([...localCanvasElements]);
          } else if (Array.isArray(step.canvasElements)) {
            canvasElements = adjustElementsForConsistentDisplay([...step.canvasElements]);
          }
            
          return {
            ...step,
            canvasElements
          };
        }),
        settings: {
          ...currentFunnel.settings
        }
      };
      
      // Atualizar o estado com o funnel clonado
      setClonedFunnel(clonedFunnelData);
      setIsPreviewReady(true);
      
      console.log("BuilderPreview - Dados prontos para preview");
    } catch (error) {
      console.error("BuilderPreview - Erro ao clonar funnel:", error);
      setIsPreviewReady(false);
    }
  }, [currentFunnel, currentStep, isMobile, localCanvasElements, canvasKey]);
  
  if (!currentFunnel) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-medium text-lg mb-2">No Funnel Selected</h3>
          <p className="text-muted-foreground text-sm">Select or create a funnel to see the preview.</p>
        </div>
      </div>
    );
  }
  
  // Se o preview ainda não está pronto, mostrar estado de carregamento
  if (!isPreviewReady || !clonedFunnel) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-muted-foreground text-sm">Carregando preview...</p>
        </div>
      </div>
    );
  }

  // Determinar se há uma imagem de fundo para aplicar estilo apropriado
  const hasBackgroundImage = !!clonedFunnel.settings?.backgroundImage;
  
  // Estilo do container de preview com espaçamentos melhorados
  const previewContainerStyle = {
    backgroundColor: clonedFunnel?.settings?.backgroundColor || '#ffffff',
    backgroundImage: clonedFunnel?.settings?.backgroundImage ? 
      `url(${clonedFunnel.settings.backgroundImage})` : 
      'none',
    backgroundSize: clonedFunnel?.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                    clonedFunnel?.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: clonedFunnel?.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundAttachment: clonedFunnel?.settings?.backgroundImageStyle === 'fixed' ? 'fixed' : 'scroll',
    minHeight: '100%',
    paddingBottom: '1rem',
    paddingTop: '1rem',
    display: 'flex',
    alignItems: 'flex-start', // Alinhamento superior para evitar espaçamentos estranhos
    justifyContent: 'center'
  };

  return (
    <div className="w-full flex items-center justify-center" style={previewContainerStyle}>
      <div className={`${isMobile ? 'max-w-sm' : 'w-full max-w-2xl'} py-1`}>
        <FunnelPreview 
          funnel={clonedFunnel} 
          isMobile={isMobile} 
          stepIndex={currentStep}
          key={`preview-${clonedFunnel.id}-step-${currentStep}-${renderKey}`}
          centerContent={false} // Desativar centralização para evitar espaçamentos extras
        />
      </div>
    </div>
  );
});

BuilderPreview.displayName = "BuilderPreview";

export default BuilderPreview;
