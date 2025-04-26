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
  isMobile?: boolean;
  centerContent?: boolean;
}

const CanvasPreview = ({ canvasElements, activeStep, onStepChange, funnel, isMobile = false, centerContent = false }: CanvasPreviewProps) => {
  console.log("CanvasPreview - Rendering with", canvasElements.length, "elements", isMobile ? "on mobile" : "on desktop");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shouldCenter, setShouldCenter] = useState(centerContent);
  
  // Determinar se deve centralizar com base no número de elementos
  useEffect(() => {
    // Se tiver muitos elementos, não centraliza (começa do topo)
    const manyElements = canvasElements.length > 3;
    setShouldCenter(centerContent && !manyElements);
  }, [canvasElements.length, centerContent]);
  
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
    
    // Aplicar a mudança de etapa diretamente, sem setTimeout
    onStepChange(index);
  };
  
  const useBackgroundOpacity = funnel?.settings?.backgroundImage && typeof funnel?.settings?.backgroundOpacity === 'number';
  const hasBackgroundImage = !!funnel?.settings?.backgroundImage;
  const contentStyle = 'transparent'; // Força estilo sempre como transparent
  
  // Determinar o estilo baseado na configuração e tipo de dispositivo
  let containerStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: hasBackgroundImage ? 'white' : 'inherit',
    transition: 'all 0.5s ease',
    borderRadius: isMobile ? '0' : '0.5rem',
    padding: isMobile ? '0.25rem' : '1rem',
    margin: isMobile ? '0 auto' : '0 auto',
    position: 'relative',
    left: isMobile ? '0' : 'auto',
    right: isMobile ? '0' : 'auto',
    width: isMobile ? '100%' : 'auto',
    overflowY: isMobile ? 'auto' : 'visible', // Permitir scroll vertical no mobile
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
      className={`${containerClass} canvas-container w-full no-gap-container`}
      style={{
        ...containerStyles,
        minHeight: 'max-content',
        paddingBottom: '1.5rem',
        paddingTop: '0.5rem',
        // Garantir que a altura seja preservada durante a transição
        // para evitar reajustes de layout
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
        overflow: 'hidden', // Evitar linhas brancas
        backgroundColor: funnel?.settings?.backgroundColor || '#ffffff', // Garantir background consistente
        position: 'relative', // Importante para o posicionamento absoluto
      }}
    >
      {/* Background sólido contínuo para evitar qualquer linha branca */}
      {isMobile && (
        <div 
          className="continuous-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: funnel?.settings?.backgroundColor || '#ffffff',
            zIndex: 1
          }}
        />
      )}
      
      {/* Renderizar dentro de um container único sem gaps */}
      <div className="elements-container" style={{
        position: 'relative',
        backgroundColor: funnel?.settings?.backgroundColor || '#ffffff',
        overflow: 'hidden',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0
      }}>
        {canvasElements.map((element, index) => {
          console.log("CanvasPreview - Processing element:", element.id, element.type);
          
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
            }
          };
          
          // Classe específica para mobile ou desktop
          const elementWrapperClass = `w-full ${isMobile ? 'mobile-element no-gap-element' : 'desktop-element'}`;
          
          // Estilos específicos para tipo de dispositivo
          const elementWrapperStyle: React.CSSProperties = isMobile 
            ? { 
                maxWidth: '100%', 
                overflow: 'hidden', 
                margin: 0, 
                padding: 0, 
                backgroundColor: funnel?.settings?.backgroundColor || '#ffffff',
                position: 'relative',
                zIndex: 10,
                // Adicionar linha de fundo para cobrir qualquer espaço
                borderBottom: `2px solid ${funnel?.settings?.backgroundColor || '#ffffff'}`
              } 
            : {};
          
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
      
      {/* Estilo global para transições suaves */}
      <style dangerouslySetInnerHTML={{__html: `
        .canvas-container {
          will-change: contents;
          transform: translateZ(0);
          overflow: hidden !important;
        }
        
        .elements-container {
          display: flex;
          flex-direction: column;
          overflow: hidden !important;
          width: 100%;
        }
        
        .mobile-element, .desktop-element {
          transition: opacity 0.3s ease, transform 0.3s ease;
          will-change: transform, opacity;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        
        .no-gap-element + .no-gap-element {
          margin-top: 0 !important;
        }
        
        .mobile-view, .desktop-view {
          transform: translateZ(0);
          backface-visibility: hidden;
          overflow: hidden !important;
        }
        
        /* Eliminar espaços entre elementos em formato mobile */
        @media (max-width: 768px) {
          .no-gap-container {
            isolation: isolate;
          }
          
          .mobile-element + .mobile-element {
            margin-top: 0 !important;
          }
          
          .mobile-element > div, 
          .mobile-element > form {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background-color: inherit !important;
          }
          
          .canvas-container > div {
            margin: 0 !important;
            overflow: hidden !important;
          }
          
          /* Estratégia radical: remover todo espaçamento */
          input, select, textarea, button {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          
          /* Solução específica para linha azul marcada */
          form + div {
            border-top: 4px solid inherit;
            margin-top: 0 !important;
          }
          
          /* Corrigir qualquer espaço entre componentes com background */
          div[class^="grid"] {
            background-color: inherit !important;
          }
          
          /* Remover margin de qualquer elemento que possa criá-la */
          * {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
        }
      `}} />
    </div>
  );
};

export default CanvasPreview;
