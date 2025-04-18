import React, { useState, useEffect } from 'react';
import { CanvasElement } from "@/types/canvasTypes";
import ElementFactory from "@/components/canvas/element-renderers/ElementFactory";
import { Funnel } from '@/utils/types';
import { accessService } from '@/services/accessService';

interface CanvasPreviewProps {
  canvasElements: CanvasElement[];
  activeStep: number;
  onStepChange: (newStep: number) => void;
  funnel?: Funnel;
}

const CanvasPreview = ({ canvasElements, activeStep, onStepChange, funnel }: CanvasPreviewProps) => {
  console.log("CanvasPreview - Rendering with", canvasElements.length, "elements");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    const initSession = async () => {
      if (funnel) {
        const newSessionId = await accessService.logAccess(funnel.id);
        setSessionId(newSessionId);
      }
    };
    
    initSession();
  }, [funnel]);
  
  const handleStepChange = async (index: number) => {
    console.log("CanvasPreview - handleStepChange called with index:", index);
    
    if (!funnel) {
      console.warn("CanvasPreview - No funnel available for navigation");
      return;
    }
    
    try {
      // Registrar interação do usuário com o funil para a etapa ATUAL
      await accessService.registerStepInteraction(
        funnel.id,
        activeStep + 1, // Usar activeStep em vez de index para registrar a etapa atual
        sessionId,
        'click'
      );
      
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
    // Garante que a mudança de etapa não seja bloqueada pelo processamento assíncrono
    setTimeout(() => {
      onStepChange(index);
    }, 50);
  };
  
  const useBackgroundOpacity = funnel?.settings?.backgroundImage && typeof funnel?.settings?.backgroundOpacity === 'number';
  
  return (
    <div 
      className="w-full mx-auto min-h-[300px] rounded-lg p-6"
      style={{
        backgroundColor: funnel?.settings?.backgroundImage 
          ? `rgba(0, 0, 0, ${useBackgroundOpacity ? funnel.settings.backgroundOpacity : 0.8})` 
          : (funnel?.settings?.backgroundColor || '#ffffff'),
        transition: 'all 0.3s ease',
        color: funnel?.settings?.backgroundImage ? 'white' : 'inherit',
        backdropFilter: funnel?.settings?.backgroundImage ? 'blur(2px)' : 'none',
      }}
    >
      {canvasElements.map((element, index) => {
        console.log("CanvasPreview - Processing element:", element.id, element.type);
        
        // Add preview properties to the element for navigation
        const elementWithPreviewProps = {
          ...element,
          previewMode: true,
          previewProps: {
            activeStep,
            onStepChange: handleStepChange,
            funnel
          }
        };
        
        return (
          <div key={element.id}>
            <ElementFactory 
              element={elementWithPreviewProps}
              onSelect={() => {}} 
              isSelected={false} 
              isDragging={false}
              onRemove={() => {}}
              index={index}
              totalElements={canvasElements.length}
              // Pass null for drag functions to disable drag in preview
              onDragStart={null}
              onDragEnd={null}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CanvasPreview;
