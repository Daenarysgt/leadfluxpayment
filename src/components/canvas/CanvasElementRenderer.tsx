import React from "react";
import { cn } from "@/lib/utils";
import { CanvasElement } from "@/types/canvasTypes";
import ElementFactory from "@/components/canvas/element-renderers/ElementFactory";
import { Trash2, Copy, ChevronUp, ChevronDown, Move, Grip } from "lucide-react";
import { adjustElementsForConsistentDisplay } from '@/components/canvas/SharedCanvasRenderer';

interface CanvasElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  index: number;
  totalElements: number;
}

const CanvasElementRenderer = ({
  element,
  isSelected,
  isDragging,
  onSelect,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  index,
  totalElements
}: CanvasElementRendererProps) => {
  // Determine if we're on mobile based on window width
  const isMobile = window.innerWidth <= 768;
  
  // Adjust element positioning for consistent display on mobile
  const adjustedElements = adjustElementsForConsistentDisplay([element], isMobile);
  const adjustedElement = adjustedElements[0];
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      // Set data for the drag operation
      e.dataTransfer.setData("elementId", element.id);
      e.dataTransfer.effectAllowed = "move";
      
      // Add a slight delay to ensure the drag effect is visible
      setTimeout(() => {
        onDragStart(element.id);
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
    <div
      className={cn(
        "relative group transition-all",
        isSelected ? "outline outline-2 outline-violet-500 rounded-sm" : "outline-none hover:outline-dashed hover:outline-1 hover:outline-gray-300 rounded-sm",
        isDragging && "opacity-50 outline outline-2 outline-blue-300"
      )}
      onClick={() => onSelect(element.id)}
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
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
        element={adjustedElement}
        onSelect={() => onSelect(element.id)}
        isSelected={isSelected}
        isDragging={isDragging}
        onRemove={() => onRemove(element.id)}
        index={index}
        totalElements={totalElements}
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
          
          {onMoveDown && index < totalElements - 1 && (
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
        </div>
      )}
    </div>
  );
};

export default CanvasElementRenderer;
