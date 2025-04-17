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
  GripVertical,
  Edit
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
  const [isHovering, setIsHovering] = useState(false);
  // Verificar se estamos em modo de preview - sem funcionalidade de drag
  const isPreviewMode = !onDragStart || element.previewMode;

  const baseElementClasses = cn(
    "w-full rounded-md mb-4 border-2 relative group",
    isSelected ? "border-violet-500" : "border-transparent",
    isDragging && "opacity-50 border-dashed border-violet-400",
    !isPreviewMode && "transition-all duration-200" // Apenas aplicar transição no modo construtor
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

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          className={baseElementClasses}
          onClick={() => onSelect(element.id)}
          onMouseEnter={() => !isPreviewMode && setIsHovering(true)}
          onMouseLeave={() => !isPreviewMode && setIsHovering(false)}
        >
          {/* Conteúdo real do elemento */}
          <div className={cn(
            "relative",
            // Adicionar padding no modo construtor para garantir área clicável mínima
            !isPreviewMode && "p-2 min-h-[60px]"
          )}>
            {children}
          </div>

          {/* Camada interativa para facilitar a seleção - só aparece no modo construtor */}
          {!isPreviewMode && (
            <div 
              className={cn(
                "absolute inset-0 cursor-pointer z-10 transition-all duration-150",
                isSelected 
                  ? "bg-violet-500/10 border-2 border-violet-500" 
                  : isHovering 
                    ? "bg-violet-500/5 border-2 border-dashed border-violet-400/60" 
                    : "bg-transparent border-2 border-transparent"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(element.id);
              }}
            >
              {/* Indicador de elemento editável */}
              {!isSelected && isHovering && (
                <div className="absolute top-2 right-2 bg-violet-100 text-violet-600 text-xs px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  <span>Editar</span>
                </div>
              )}
            </div>
          )}
          
          {/* Only show drag handle when the element is selected */}
          {isSelected && onDragStart && !isPreviewMode && (
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
          
          {/* Right-side element actions */}
          {isSelected && !isPreviewMode && (
            <div className="absolute right-2 top-2 flex items-center gap-1 bg-white/80 rounded-md p-1 shadow-sm">
              {onDuplicate && (
                <button
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100"
                  onClick={handleDuplicate}
                  title="Duplicar elemento"
                >
                  <Copy className="h-3.5 w-3.5 text-gray-600" />
                </button>
              )}
              <button
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-100"
                onClick={handleRemove}
                title="Remover elemento"
              >
                <Trash className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      
      {!isPreviewMode && (
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onSelect(element.id)}>
            Editar elemento
          </ContextMenuItem>
          
          {onDuplicate && (
            <ContextMenuItem onClick={() => onDuplicate(element.id)}>
              Duplicar elemento
            </ContextMenuItem>
          )}
          
          <ContextMenuSeparator />
          
          {showMoveUp && (
            <ContextMenuItem onClick={() => onMoveUp && onMoveUp(element.id)}>
              Mover para cima
            </ContextMenuItem>
          )}
          
          {showMoveDown && (
            <ContextMenuItem onClick={() => onMoveDown && onMoveDown(element.id)}>
              Mover para baixo
            </ContextMenuItem>
          )}
          
          <ContextMenuSeparator />
          
          <ContextMenuItem 
            onClick={() => onRemove(element.id)}
            className="text-red-600"
          >
            Remover elemento
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
};

export default BaseElementRenderer;
