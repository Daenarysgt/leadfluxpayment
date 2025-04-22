import React from 'react';
import { CanvasElement } from "@/types/canvasTypes";
import ElementFactory from "@/components/canvas/element-renderers/ElementFactory";
import { Funnel } from '@/utils/types';
import { Trash2, Copy, ChevronUp, ChevronDown, Grip } from "lucide-react";
import { cn } from "@/lib/utils";

interface SharedCanvasRendererProps {
  canvasElements: CanvasElement[];
  isMobile: boolean;
  isBuilderMode?: boolean;
  funnel?: Funnel;
  activeStep?: number;
  onStepChange?: (newStep: number) => void;
  onSelect?: (id: string) => void;
  selectedElementId?: string;
  onRemove?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

// Esta função ajusta os elementos para garantir que sejam renderizados
// de forma consistente em qualquer ambiente (builder ou preview)
export const adjustElementsForConsistentDisplay = (
  elementsToAdjust: CanvasElement[],
  isMobile: boolean
): CanvasElement[] => {
  // Clone os elementos para não modificar o original
  const adjustedElements = JSON.parse(JSON.stringify(elementsToAdjust));
  
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
          width: window.innerWidth - 16 // Mesma lógica em ambos os componentes
        };
      }
    }
    
    return adjustedElement;
  });
};

const SharedCanvasRenderer: React.FC<SharedCanvasRendererProps> = ({
  canvasElements,
  isMobile,
  isBuilderMode = false,
  funnel,
  activeStep = 0,
  onStepChange,
  onSelect,
  selectedElementId,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  isDragging
}) => {
  // Ajustar os elementos para renderização consistente
  const adjustedElements = adjustElementsForConsistentDisplay(canvasElements, isMobile);
  
  // Classes condicionais para desktop e mobile
  const containerClass = isMobile 
    ? "w-full mx-auto min-h-[300px] mobile-full-width" 
    : "w-full mx-auto min-h-[300px] rounded-lg";
  
  // Estilos comuns para o container
  const containerStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: 'inherit',
    transition: 'all 0.3s ease',
    borderRadius: isMobile ? '0' : '0.5rem',
    padding: isMobile ? '0.25rem' : '1rem',
    margin: isMobile ? '0 auto' : '0 auto',
    position: 'relative',
    left: isMobile ? '0' : 'auto',
    right: isMobile ? '0' : 'auto',
    width: isMobile ? '100%' : 'auto',
    minHeight: 'max-content',
    paddingBottom: '2rem'
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (onDragStart) {
      // Set data for the drag operation
      e.dataTransfer.setData("elementId", id);
      e.dataTransfer.effectAllowed = "move";
      
      // Add a slight delay to ensure the drag effect is visible
      setTimeout(() => {
        onDragStart(id);
      }, 0);
    }
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (onDragEnd) {
      onDragEnd();
    }
  };
  
  return (
    <div className={containerClass} style={containerStyles}>
      {adjustedElements.map((element, index) => {
        // Adicionar classes específicas para telas móveis aos elementos
        const elementWrapperClass = isMobile ? "w-full mobile-element" : "w-full";
        
        // Estilos específicos para o wrapper do elemento em dispositivos móveis
        const elementWrapperStyle: React.CSSProperties = isMobile ? {
          position: 'relative',
          left: '0',
          right: '0',
          margin: '0 auto',
          width: '100%',
          padding: '0',
          transform: 'none'
        } : {};
        
        // Add preview properties to the element for navigation
        const elementWithProps = {
          ...element,
          previewMode: !isBuilderMode,
          previewProps: !isBuilderMode ? {
            activeStep,
            onStepChange,
            funnel,
            isMobile
          } : undefined
        };
        
        const isSelected = selectedElementId === element.id;
        const elementIsDragging = isDragging && element.id === selectedElementId;
        
        return (
          <div 
            key={element.id} 
            className={elementWrapperClass}
            style={elementWrapperStyle}
          >
            {isBuilderMode ? (
              <div
                className={cn(
                  "relative group transition-all",
                  isSelected ? "outline outline-2 outline-violet-500 rounded-sm" : "outline-none hover:outline-dashed hover:outline-1 hover:outline-gray-300 rounded-sm",
                  elementIsDragging && "opacity-50 outline outline-2 outline-blue-300"
                )}
                onClick={() => onSelect && onSelect(element.id)}
                draggable={!!onDragStart}
                onDragStart={(e) => handleDragStart(e, element.id)}
                onDragEnd={handleDragEnd}
              >
                {/* Handle para arrastar o elemento */}
                {onDragStart && (
                  <div 
                    className={cn(
                      "absolute top-0 left-0 bg-white/80 rounded-br-md z-10 opacity-0 group-hover:opacity-100 transition-opacity",
                      isSelected && "opacity-100"
                    )}
                    onMouseDown={(e) => {
                      // Garantir que o clique no handle não interfira na seleção
                      e.stopPropagation();
                    }}
                  >
                    <div className="p-1 text-gray-600 cursor-grab active:cursor-grabbing">
                      <Grip className="h-4 w-4" />
                    </div>
                  </div>
                )}
                
                {/* Elemento atual */}
                <ElementFactory 
                  element={elementWithProps}
                  onSelect={() => onSelect && onSelect(element.id)}
                  isSelected={isSelected}
                  isDragging={elementIsDragging}
                  onRemove={() => onRemove && onRemove(element.id)}
                  index={index}
                  totalElements={adjustedElements.length}
                  onDragStart={null}
                  onDragEnd={null}
                />
                
                {/* Barra de ações do elemento */}
                {isSelected && (
                  <div className="absolute -top-8 right-0 flex items-center space-x-1 bg-white shadow-md rounded-md border p-1 z-20">
                    {onMoveUp && index > 0 && (
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
                        title="Mover para cima"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveUp(element.id);
                        }}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    )}
                    
                    {onMoveDown && index < adjustedElements.length - 1 && (
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
                        title="Mover para baixo"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveDown(element.id);
                        }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                    
                    {onDuplicate && (
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100"
                        title="Duplicar elemento"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(element.id);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                    
                    {onRemove && (
                      <button 
                        className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                        title="Remover elemento"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(element.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <ElementFactory 
                element={elementWithProps}
                onSelect={() => {}} 
                isSelected={false} 
                isDragging={false}
                onRemove={() => {}}
                index={index}
                totalElements={adjustedElements.length}
                onDragStart={null}
                onDragEnd={null}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SharedCanvasRenderer; 