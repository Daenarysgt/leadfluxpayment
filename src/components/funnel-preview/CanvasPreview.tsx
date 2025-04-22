import React, { useState, useEffect } from 'react';
import { CanvasElement } from "@/types/canvasTypes";
import { Funnel } from '@/utils/types';
import { accessService } from '@/services/accessService';
import SharedCanvasRenderer from '@/components/canvas/SharedCanvasRenderer';

interface CanvasPreviewProps {
  canvasElements: CanvasElement[];
  activeStep: number;
  onStepChange: (newStep: number) => void;
  funnel?: Funnel;
}

const CanvasPreview = ({ canvasElements, activeStep, onStepChange, funnel }: CanvasPreviewProps) => {
  console.log("CanvasPreview - Rendering with", canvasElements.length, "elements");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detectar se é dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Verificar no carregamento
    checkMobile();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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
    console.log("CanvasPreview - handleStepChange called com índice:", index);
    
    if (!funnel) {
      console.warn("CanvasPreview - No funnel available for navigation");
      return;
    }
    
    // Validar se o índice é válido
    if (index < 0 || index >= funnel.steps.length) {
      console.error(`CanvasPreview - Índice de etapa inválido: ${index}. Range válido: 0-${funnel.steps.length - 1}`);
      return;
    }
    
    console.log(`CanvasPreview - Navegando da etapa ${activeStep} para etapa ${index}`);
    
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
    
    // Garantir que a mudança de etapa não seja bloqueada pelo processamento assíncrono
    setTimeout(() => {
      console.log("CanvasPreview - Executando mudança de etapa para:", index);
      onStepChange(index);
    }, 100);
  };
  
  return (
    <SharedCanvasRenderer
      canvasElements={canvasElements}
      isMobile={isMobile}
      isBuilderMode={false}
      activeStep={activeStep}
      onStepChange={handleStepChange}
      funnel={funnel}
    />
  );
};

export default CanvasPreview;
