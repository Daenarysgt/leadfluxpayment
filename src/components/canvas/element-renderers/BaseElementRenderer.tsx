
import { ReactNode, useState } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Trash,
  GripVertical
} from "lucide-react";

interface BaseElementRendererProps extends ElementRendererProps {
  children: ReactNode;
}

const BaseElementRenderer = ({
  element,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
  isDragging,
  index,
  totalElements,
  children
}: BaseElementRendererProps) => {
  const baseElementClasses = cn(
    "w-full rounded-md mb-4 border-2 relative group",
    isSelected ? "border-violet-500" : "border-transparent",
    isDragging && "opacity-50 border-dashed border-violet-400"
  );

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveUp) onMoveUp(element.id);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveDown) onMoveDown(element.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) onDuplicate(element.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(element.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    
    // Set the drag data
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("elementId", element.id);
    e.dataTransfer.setData("text/plain", element.id);
    
    // Create custom drag preview
    const dragPreview = document.createElement("div");
    dragPreview.classList.add("bg-white", "p-3", "border", "shadow-md", "rounded", "text-sm");
    dragPreview.textContent = `Movendo: ${element.content?.title || element.type}`;
    document.body.appendChild(dragPreview);
    
    e.dataTransfer.setDragImage(dragPreview, 20, 20);
    
    // Clean up after dragimage is captured
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
    
    if (onDragStart) onDragStart(element.id);
  };

  const showMoveUp = index > 0;
  const showMoveDown = index < totalElements - 1;
  
  // Check if we're in preview mode (no drag functionality)
  const isPreviewMode = !onDragStart;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          className={baseElementClasses}
          onClick={() => onSelect(element.id)}
        >
          {children}
          
          {/* Only show drag handle when the element is selected */}
          {isSelected && onDragStart && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center">
              <div 
                className="w-8 h-8 bg-violet-100 flex items-center justify-center cursor-grab active:cursor-grabbing rounded-br transition-opacity"
                draggable={true}
                onDragStart={handleDragStart}
                onDragEnd={onDragEnd}
                title="Arrastar para reordenar"
              >
                <GripVertical className="h-4 w-4 text-violet-500" />
              </div>
            </div>
          )}
          
          {/* Only show up/down buttons when NOT in preview mode */}
          {!isPreviewMode && (
            <div className="absolute -left-10 top-0 h-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {showMoveUp && (
                <button 
                  className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center mb-1 hover:bg-gray-100"
                  onClick={handleMoveUp}
                  title="Mover para cima"
                >
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                </button>
              )}
              {showMoveDown && (
                <button 
                  className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100"
                  onClick={handleMoveDown}
                  title="Mover para baixo"
                >
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                </button>
              )}
            </div>
          )}
          
          {isSelected && (
            <div className="absolute -right-2 -top-2 flex space-x-1">
              <button
                className="w-6 h-6 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100"
                onClick={handleDuplicate}
                title="Duplicar"
              >
                <Copy className="h-3 w-3 text-gray-600" />
              </button>
              <button
                className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                onClick={handleRemove}
                title="Remover"
              >
                <Trash className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => onSelect(element.id)}>
          Selecionar
        </ContextMenuItem>
        <ContextMenuSeparator />
        {showMoveUp && !isPreviewMode && (
          <ContextMenuItem onClick={() => onMoveUp && onMoveUp(element.id)}>
            <ChevronUp className="mr-2 h-4 w-4" />
            Mover para cima
          </ContextMenuItem>
        )}
        {showMoveDown && !isPreviewMode && (
          <ContextMenuItem onClick={() => onMoveDown && onMoveDown(element.id)}>
            <ChevronDown className="mr-2 h-4 w-4" />
            Mover para baixo
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => onDuplicate && onDuplicate(element.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicar
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => onRemove(element.id)}
          className="text-red-600 focus:text-red-50 focus:bg-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          Remover
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default BaseElementRenderer;
