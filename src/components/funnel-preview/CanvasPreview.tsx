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
      // Removemos o registro automático de interação 'click' aqui
      // Agora apenas atualizamos o progresso sem registrar interações falsas
      
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
  
  const useBackgroundOpacity = funnel?.settings?.backgroundImage && typeof funnel?.settings?.backgroundOpacity === 'number';
  const hasBackgroundImage = !!funnel?.settings?.backgroundImage;
  const contentStyle = 'transparent'; // Força estilo sempre como transparent
  
  // Determinar o estilo baseado na configuração e tipo de dispositivo
  let containerStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: hasBackgroundImage ? 'white' : 'inherit',
    transition: 'all 0.3s ease',
    borderRadius: isMobile ? '0' : '0.5rem',
    padding: '0', // Remover padding para consistência com o editor
    margin: '0 auto',
    position: 'relative',
    width: isMobile ? '100%' : 'auto',
    maxWidth: isMobile ? '360px' : '600px', // Mesma largura usada no builder
    overflow: 'hidden',
  };

  // Classes condicionais para desktop e mobile
  const containerClass = isMobile 
    ? "w-full mx-auto min-h-[300px] mobile-full-width" 
    : "w-full mx-auto min-h-[300px] rounded-lg";
  
  // Adicionar logs para monitorar eventos de clique e registros de interação

  // Melhorar a função handleNextStep para garantir que interações sejam registradas
  const handleNextStep = (event: React.MouseEvent) => {
    // Evitar comportamento padrão do botão
    event.preventDefault();
    
    console.log('Botão clicado em CanvasPreview. Avançando para próximo passo.');
    
    // Removemos o registro automático de interação aqui
    // As interações devem ser registradas apenas quando o usuário realmente interage com elementos
    
    // Avançar para o próximo passo
    if (onStepChange) {
      const nextStep = activeStep + 1;
      console.log(`Alterando para o passo ${nextStep}`);
      onStepChange(nextStep);
    }
  };
  
  return (
    <div 
      className={containerClass}
      style={{
        ...containerStyles,
        minHeight: 'max-content',
        paddingBottom: '2rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {canvasElements.map((element, index) => {
        console.log("CanvasPreview - Processing element:", element.id, element.type);
        
        // Ajustar a posição dos elementos em dispositivos móveis
        const adjustedElement = { ...element };
        
        // Para dispositivos móveis, modificar as posições e dimensões
        // usando exatamente a mesma lógica do BuilderCanvas
        if (isMobile) {
          // Assegurar que elementos com position tenham left=0 para evitar deslocamento
          if (adjustedElement.position) {
            adjustedElement.position = {
              ...adjustedElement.position,
              x: 0 // Forçar alinhamento à esquerda
            };
          }
          
          // Assegurar largura máxima para caber na tela usando o mesmo valor fixo do builder
          if (adjustedElement.dimensions) {
            adjustedElement.dimensions = {
              ...adjustedElement.dimensions,
              width: 360 - 16 // Usar a mesma largura fixa de 360px menos um pequeno espaçamento
            };
          }
          
          // Ajustes adicionais para garantir consistência total com o BuilderCanvas
          if (!adjustedElement.content) {
            adjustedElement.content = {};
          }
          
          // Remover qualquer padding adicional
          if (adjustedElement.style?.padding) {
            adjustedElement.style.padding = '0px';
          }
          
          // Garantir que elementos com margens negativas sejam tratados corretamente
          if (adjustedElement.content.marginTop && adjustedElement.content.marginTop < 0) {
            adjustedElement.content.marginTop = 0;
          }
          
          // Assegurar que o alinhamento de texto é consistente
          if (adjustedElement.style?.textAlign && !adjustedElement.content.textAlign) {
            adjustedElement.content.textAlign = adjustedElement.style.textAlign;
          }
        }
        
        // Add preview properties to the element for navigation
        const elementWithPreviewProps = {
          ...adjustedElement,
          previewMode: true,
          previewProps: {
            activeStep,
            onStepChange: handleStepChange,
            funnel,
            isMobile
          }
        };
        
        // Adicionar classes específicas para telas móveis aos elementos
        const elementWrapperClass = isMobile ? "w-full mobile-element" : "w-full";
        
        // Estilos específicos para o wrapper do elemento
        const elementWrapperStyle: React.CSSProperties = isMobile ? {
          position: 'relative',
          left: '0',
          margin: '0 auto',
          width: '100%',
          padding: '0',
          transform: 'none',
          marginBottom: '1rem', // Mesmo valor usado no BaseElementRenderer
        } : {
          position: 'relative',
          margin: '0 auto',
          width: '100%',
          padding: '0',
          marginBottom: '1rem', // Mesmo valor usado no BaseElementRenderer
        };
        
        return (
          <div 
            key={element.id} 
            className={elementWrapperClass}
            style={elementWrapperStyle}
          >
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
