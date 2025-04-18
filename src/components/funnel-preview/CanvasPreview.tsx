import React, { useState, useEffect } from 'react';
import { CanvasElement } from "@/types/canvasTypes";
import ElementFactory from "@/components/canvas/element-renderers/ElementFactory";
import { Funnel } from '@/utils/types';
import { accessService } from '@/services/accessService';
import LogoDisplay from './LogoDisplay';

interface CanvasPreviewProps {
  canvasElements: CanvasElement[];
  activeStep: number;
  onStepChange: (newStep: number) => void;
  funnel?: Funnel;
  showLogo?: boolean; // Nova prop para controlar se o logo deve ser exibido aqui
}

const CanvasPreview = ({ canvasElements, activeStep, onStepChange, funnel, showLogo = true }: CanvasPreviewProps) => {
  console.log("CanvasPreview - Rendering with", canvasElements.length, "elements");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Debug para verificar se o logo está presente no funnel
  useEffect(() => {
    if (funnel?.settings?.logo) {
      console.log("CanvasPreview - Funnel tem logo nas settings:", 
        typeof funnel.settings.logo, 
        funnel.settings.logo.substring(0, 30) + "..."
      );
    } else {
      console.log("CanvasPreview - Funnel não tem logo nas settings");
    }
  }, [funnel]);
  
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
  
  return (
    <div className="flex flex-col w-full">
      {/* Exibir o logotipo do funil acima do canvas apenas se showLogo=true */}
      {showLogo && funnel?.settings?.logo && (
        <LogoDisplay logo={funnel.settings.logo} />
      )}
      
      <div 
        className="w-full mx-auto min-h-[300px] rounded-lg p-6"
        style={{
          backgroundColor: funnel?.settings?.backgroundColor || '#ffffff',
          transition: 'background-color 0.3s ease'
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
    </div>
  );
};

export default CanvasPreview;
