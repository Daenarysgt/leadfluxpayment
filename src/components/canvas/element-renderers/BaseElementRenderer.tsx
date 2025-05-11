import { ReactNode, useState, useRef, useEffect } from "react";
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
  Edit,
  Move,
  MoveDown
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
  const [dragActive, setDragActive] = useState(false);
  const [dropTarget, setDropTarget] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
  
  // Verificar se estamos em modo de preview - sem funcionalidade de drag
  const isPreviewMode = !onDragStart || element.previewMode;

  // Efeito para garantir que o elemento seja visível quando selecionado
  // (scroll para o elemento se necessário)
  useEffect(() => {
    if (isSelected && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const isVisible = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      if (!isVisible) {
        elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isSelected]);

  // Resetar o estado de dropTarget e dragActive quando isDragging muda
  useEffect(() => {
    if (!isDragging) {
      setDropTarget(false);
      setDragActive(false);
    }
  }, [isDragging]);

  // Limpar estados ao desmontar o componente
  useEffect(() => {
    return () => {
      setDragActive(false);
      setDropTarget(false);
    };
  }, []);

  const baseElementClasses = cn(
    "w-full rounded-md relative group",
    isSelected ? "outline outline-2 outline-violet-500" : "outline-none",
    isDragging && "opacity-50 outline-dashed outline-2 outline-violet-400",
    dropTarget && !isDragging && "outline outline-2 outline-violet-500 bg-violet-50/30 shadow-sm",
    !isPreviewMode && "transition-all duration-200" // Apenas aplicar transição no modo construtor
  );

  // Adicionar handler de clique com prevenção de re-seleção
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Verificar se o componente já está selecionado
    if (isSelected) {
      console.log("Element already selected, ignoring click");
      return;
    }
    
    // Se não está selecionado, chamar onSelect
    if (onSelect) {
      onSelect(element.id);
    }
  };

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
    setDragActive(true);
    
    // Set the drag data - importante definir no início
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("elementId", element.id);
    e.dataTransfer.setData("text/plain", element.id);
    
    // Create custom drag preview - um indicador mais compacto
    const dragPreview = document.createElement("div");
    dragPreview.classList.add(
      "bg-violet-600", 
      "text-white",
      "p-2", 
      "rounded-md", 
      "shadow-lg", 
      "flex", 
      "items-center", 
      "gap-2",
      "text-sm",
      "font-medium",
      "select-none"
    );
    
    // Ícone + texto para o drag preview
    const iconSpan = document.createElement("span");
    iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`;
    
    const textSpan = document.createElement("span");
    textSpan.textContent = element.content?.title || element.type;
    
    dragPreview.appendChild(iconSpan);
    dragPreview.appendChild(textSpan);
    
    // Adicionamos o elemento ao DOM para usar como preview
    document.body.appendChild(dragPreview);
    
    // Definimos a imagem de drag personalizada
    e.dataTransfer.setDragImage(dragPreview, 20, 20);
    
    // Limpamos após capturar a imagem
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
    
    if (onDragStart) onDragStart(element.id);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Limpar os estados locais
    setDragActive(false);
    setDropTarget(false);
    
    // Notificar o componente pai
    if (onDragEnd) onDragEnd();
    
    // Garantir que o estado de drag seja limpo
    setTimeout(() => {
      setDragActive(false);
      setDropTarget(false);
    }, 50);
  };

  // Essa função não é mais necessária com o novo sistema
  const handleDragOver = (e: React.DragEvent) => {
    // Não permitir soltar sobre si mesmo ou se este elemento estiver sendo arrastado
    if (isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Para garantir consistência com o novo sistema, apenas configurar o efeito visual
    e.dataTransfer.dropEffect = "move";
  };
  
  // Essa função não é mais necessária com o novo sistema
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Limpar estado visual
    setDropTarget(false);
  };

  // Esta função será simplificada, já que a reordenação principal será feita pelas zonas de drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Limpar o estado visual
    setDropTarget(false);
    setDragActive(false);
    
    // Se o elemento que estamos arrastando é este, não faça nada
    if (isDragging) return;
    
    // Verificar se temos um element ID nos dados de transferência
    const draggedElementId = e.dataTransfer.getData('elementId');
    
    if (draggedElementId && draggedElementId !== element.id) {
      console.log(`Element dropped: ${draggedElementId} on ${element.id}`);
      
      // BuilderCanvas vai lidar com a reordenação real
      if (elementRef.current) {
        const dropEvent = new CustomEvent('elementDropped', {
          bubbles: true,
          detail: {
            sourceId: draggedElementId,
            targetId: element.id
          }
        });
        
        elementRef.current.dispatchEvent(dropEvent);
      }
    }
  };

  const showMoveUp = index > 0;
  const showMoveDown = index < totalElements - 1;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={elementRef}
          className={cn(
            "group relative element-wrapper",
            isSelected ? "ring-4 ring-violet-400 ring-offset-0" : "hover:ring-2 hover:ring-violet-200/60",
            dragActive ? "cursor-grabbing opacity-50 scale-[0.98] transition-transform" : "cursor-grab",
            isHovering ? "bg-gray-50/50" : "bg-transparent",
            dropTarget ? "ring-4 ring-violet-300 ring-offset-0" : "",
            "rounded-md transition-all"
          )}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(element.id);
          }}
          draggable={!isPreviewMode}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            transform: dragActive ? 'scale(0.98)' : 'scale(1)',
            boxShadow: dragActive ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none',
            transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s'
          }}
        >
          {/* Conteúdo real do elemento */}
          <div className="relative">
            {children}
          </div>

          {/* Camada interativa para facilitar a seleção - só aparece no modo construtor */}
          {!isPreviewMode && (
            <div 
              className={cn(
                "absolute inset-0 cursor-pointer transition-all duration-150",
                // Para accordion, ajustar o z-index para permitir cliques no ícone dropdown
                element.type === "accordion" ? "z-0" : "z-10",
                isSelected 
                  ? "bg-violet-500/10 outline outline-2 outline-violet-500" 
                  : isHovering 
                    ? "bg-violet-100/40 outline outline-1 outline-dashed outline-violet-400/80" 
                    : dropTarget ? "bg-violet-100/40 outline outline-2 outline-violet-500" : "bg-transparent outline-none"
              )}
              onClick={(e) => {
                e.stopPropagation();
                // Se for accordion, verificar se o clique foi na área do ícone dropdown (direita)
                if (element.type === "accordion") {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  // Aumentar a área de clique ignorada no lado direito para permitir interação com ícone
                  if (clickX > rect.width - 100) {
                    return; // Não selecionar, permitir que o clique passe para o ícone
                  }
                  
                  // Também não ativar o clique em elementos internos que têm interação própria
                  const target = e.target as HTMLElement;
                  if (target.closest('.cursor-pointer') && target !== e.currentTarget) {
                    return;
                  }
                }
                onSelect(element.id);
              }}
            >
              {/* Indicador de elemento editável */}
              {!isSelected && isHovering && !dropTarget && (
                <div className="absolute top-2 right-2 bg-violet-100 text-violet-600 text-xs px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  <span>Editar</span>
                </div>
              )}

              {/* Indicador de drop */}
              {dropTarget && !isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-1 bg-white text-violet-600 px-3 py-1.5 rounded-full shadow-md text-sm">
                    <MoveDown className="h-4 w-4" />
                    <span>Soltar aqui</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Handle de arrastar - agora posicionado fora do espaço de conteúdo */}
          {isSelected && onDragStart && !isPreviewMode && (
            <div className="absolute -left-8 top-0 bottom-0 flex items-center z-20">
              <div 
                className={cn(
                  "w-8 h-8 bg-violet-100 flex items-center justify-center rounded-br transition-all shadow-sm",
                  dragActive ? "bg-violet-200 cursor-grabbing" : "cursor-grab",
                )}
                draggable={true}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                title="Arraste para reordenar"
              >
                <GripVertical className="h-4 w-4 text-violet-500" />
              </div>
            </div>
          )}
          
          {/* Botão de arrasto centralizado posicionado fora do espaço de conteúdo */}
          {isSelected && onDragStart && !isPreviewMode && (
            <div className="absolute right-1/2 translate-x-1/2 -bottom-5 z-30">
              <div 
                className={cn(
                  "w-10 h-5 bg-violet-100 rounded-b-md flex items-center justify-center shadow-sm hover:bg-violet-200",
                  dragActive ? "bg-violet-200 cursor-grabbing" : "cursor-grab"
                )}
                draggable={true}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                title="Arraste para reordenar"
              >
                <Move className="h-3 w-3 text-violet-500" />
              </div>
            </div>
          )}
          
          {/* Botões de navegação fixados no lado (fora do espaço de conteúdo) */}
          {!isPreviewMode && (isSelected || isHovering) && (
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-white rounded-lg p-1 shadow-lg z-[999] border border-violet-200">
              {showMoveUp && (
                <button 
                  className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center text-white"
                  onClick={handleMoveUp}
                  style={{
                    position: 'relative',
                    zIndex: 9999
                  }}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              )}
              {showMoveDown && (
                <button 
                  className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center text-white"
                  onClick={handleMoveDown}
                  style={{
                    position: 'relative',
                    zIndex: 9999
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          
          {/* Botões de ações no lado direito (fora do espaço de conteúdo) */}
          {isSelected && !isPreviewMode && (
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 bg-white/80 rounded-md p-1 shadow-sm z-20">
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
