import React, { useEffect, useState } from 'react';
import FunnelPreview from "@/components/FunnelPreview"; // Importação direta do componente principal
import { useStore } from "@/utils/store";
import { Funnel } from '@/utils/types';
import { CanvasElement } from '@/types/canvasTypes';

const BuilderPreview = React.memo(({ isMobile }: { isMobile: boolean }) => {
  const { currentFunnel, currentStep } = useStore();
  // Estado para rastrear se o preview está pronto para renderizar
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  
  // Criar um estado local para o funnel clonado para evitar problemas de referência
  const [clonedFunnel, setClonedFunnel] = useState<Funnel | null>(null);
  
  // Função para ajustar os elementos para renderização mais próxima da pré-visualização
  // Similar à usada no BuilderCanvas para garantir consistência
  const adjustElementsForConsistentDisplay = (elementsToAdjust: CanvasElement[]): CanvasElement[] => {
    if (!Array.isArray(elementsToAdjust)) return [];
    
    // Clone os elementos para não modificar o original
    const adjustedElements = [...elementsToAdjust];
    
    return adjustedElements.map((element: CanvasElement) => {
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
      
      return adjustedElement;
    });
  };
  
  // Efeito para clonar o funnel corretamente quando ele ou a etapa mudar
  useEffect(() => {
    if (!currentFunnel) {
      setIsPreviewReady(false);
      return;
    }
    
    console.log("BuilderPreview - Preparando dados para preview");
    
    // Clonar funnel de forma estruturada para garantir que todos os dados sejam preservados
    try {
      // Clonagem estruturada para preservar propriedades importantes
      const clonedFunnelData = {
        ...currentFunnel,
        steps: currentFunnel.steps.map(step => {
          // Garantir que canvasElements seja um array válido e ajustado
          const canvasElements = Array.isArray(step.canvasElements) ? 
            adjustElementsForConsistentDisplay([...step.canvasElements]) : 
            [];
            
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
  }, [currentFunnel, currentStep, isMobile]);
  
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
  
  return (
    <div className="w-full flex items-center justify-center" 
         style={{ 
           backgroundColor: clonedFunnel.settings?.backgroundColor || '#ffffff',
           backgroundImage: hasBackgroundImage ? `url(${clonedFunnel.settings.backgroundImage})` : 'none',
           backgroundSize: clonedFunnel.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                           clonedFunnel.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: clonedFunnel.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat',
           backgroundAttachment: clonedFunnel.settings?.backgroundImageStyle === 'fixed' ? 'fixed' : 'scroll',
           minHeight: '100%',
           paddingBottom: '3rem'
         }}>
      <div className={`${isMobile ? 'max-w-sm' : 'w-full'} py-6`}>
        <FunnelPreview 
          funnel={clonedFunnel} 
          isMobile={isMobile} 
          stepIndex={currentStep}
          key={`preview-${clonedFunnel.id}-step-${currentStep}`} 
        />
      </div>
    </div>
  );
});

BuilderPreview.displayName = "BuilderPreview";

export default BuilderPreview;
