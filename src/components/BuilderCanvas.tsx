import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BuilderCanvasProps, CanvasElement } from "@/types/canvasTypes";
import { useCanvasElements } from "@/hooks/useCanvasElements";
import CanvasElementRenderer from "@/components/canvas/CanvasElementRenderer";
import CanvasDropZone from "@/components/canvas/CanvasDropZone";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/utils/store";
import ProgressBar from "@/components/funnel-preview/ProgressBar";
import { useCanvasResize } from "@/hooks/useCanvasResize";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Undo2, Redo2 } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const BuilderCanvas = ({ 
  isMobile, 
  onElementSelect, 
  selectedElementId, 
  elementUpdates,
  elements: initialElements,
  onElementsChange 
}: BuilderCanvasProps) => {
  const { toast } = useToast();
  const { currentFunnel, currentStep } = useStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);
  
  // Usar o hook de redimensionamento do canvas para evitar a borda branca
  const { fixCanvasWhiteSpace } = useCanvasResize();
  
  // Função para ajustar os elementos para renderização mais próxima da pré-visualização
  const adjustElementsForConsistentDisplay = (elementsToAdjust: CanvasElement[]): CanvasElement[] => {
    // Clone os elementos para não modificar o original
    const adjustedElements = JSON.parse(JSON.stringify(elementsToAdjust));
    
    return adjustedElements.map((element: CanvasElement) => {
      const adjustedElement = { ...element };
      
      // Para dispositivos móveis, modificar as posições e dimensões como no CanvasPreview
      if (isMobile) {
        // Assegurar que elementos com position tenham left=0 para evitar deslocamento
        if (adjustedElement.position) {
          adjustedElement.position = {
            ...adjustedElement.position,
            x: 0 // Forçar alinhamento à esquerda como no CanvasPreview
          };
        }
        
        // Assegurar largura máxima para caber na tela
        if (adjustedElement.dimensions) {
          adjustedElement.dimensions = {
            ...adjustedElement.dimensions,
            width: window.innerWidth - 16 // Usar a largura total menos um pequeno espaçamento
          };
        }
      }
      
      return adjustedElement;
    });
  };
  
  const { 
    elements, 
    addElement, 
    removeElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    reorderElements,
    undo,
    redo,
    canUndo,
    canRedo
  } = useCanvasElements(initialElements, onElementsChange, elementUpdates, selectedElementId);
  
  // Configurar atalhos de teclado
  useKeyboardShortcuts({
    onUndo: () => {
      if (canUndo) {
        console.log("BuilderCanvas - Keyboard shortcut triggered: Undo");
        const success = undo();
        if (success && onElementsChange) {
          // Forçar re-renderização após desfazer
          setTimeout(() => {
            setRenderKey(prev => prev + 1);
            console.log("BuilderCanvas - Forced re-render after undo");
          }, 50);
        }
      } else {
        console.log("BuilderCanvas - Undo not available");
      }
    },
    onRedo: () => {
      if (canRedo) {
        console.log("BuilderCanvas - Keyboard shortcut triggered: Redo");
        const success = redo();
        if (success && onElementsChange) {
          // Forçar re-renderização após refazer
          setTimeout(() => {
            setRenderKey(prev => prev + 1);
            console.log("BuilderCanvas - Forced re-render after redo");
          }, 50);
        }
      } else {
        console.log("BuilderCanvas - Redo not available");
      }
    },
    onDelete: () => {
      if (selectedElementId) {
        console.log(`BuilderCanvas - Keyboard shortcut triggered: Delete element ${selectedElementId}`);
        removeElement(selectedElementId);
        if (onElementSelect) {
          onElementSelect(null);
        }
      }
    }
  });
  
  // Aplicar o ajuste aos elementos
  const displayElements = adjustElementsForConsistentDisplay(elements);
  
  // Define all callback hooks consistently at the top level
  const handleDrop = useCallback((componentType: string) => {
    const newElement = addElement(componentType);
    if (newElement && onElementSelect) {
      onElementSelect(newElement);
    }
    
    // Reset drag state
    setIsExternalDragOver(false);
    
    // Corrigir a borda branca após adicionar um elemento
    setTimeout(fixCanvasWhiteSpace, 100);
  }, [addElement, onElementSelect, fixCanvasWhiteSpace]);
  
  const handleElementSelect = useCallback((id: string) => {
    console.log("BuilderCanvas - Selecting element with ID:", id);
    
    // Verificar se o elemento já está selecionado - evitar re-seleção
    if (id === selectedElementId) {
      console.log("BuilderCanvas - Element already selected:", id);
      return;
    }
    
    const selectedElement = elements.find(el => el.id === id);
    if (selectedElement && onElementSelect) {
      console.log("BuilderCanvas - Found element:", selectedElement);
      onElementSelect(selectedElement);
    } else {
      console.log("BuilderCanvas - Element not found with ID:", id);
      if (onElementSelect) {
        onElementSelect(null);
      }
    }
  }, [elements, onElementSelect, selectedElementId]);
  
  const handleElementRemove = useCallback((id: string) => {
    console.log("BuilderCanvas - Removing element with ID:", id);
    removeElement(id);
    
    if (selectedElementId === id && onElementSelect) {
      onElementSelect(null);
    }
  }, [removeElement, selectedElementId, onElementSelect]);

  const handleElementDuplicate = useCallback((id: string) => {
    console.log("BuilderCanvas - Duplicating element with ID:", id);
    const newElement = duplicateElement(id);
    if (newElement) {
      toast({
        title: "Elemento duplicado",
        description: "O elemento foi duplicado com sucesso."
      });
    }
  }, [duplicateElement, toast]);

  const handleElementMoveUp = useCallback((id: string) => {
    console.log("BuilderCanvas - Moving element up with ID:", id);
    moveElementUp(id);
  }, [moveElementUp]);

  const handleElementMoveDown = useCallback((id: string) => {
    console.log("BuilderCanvas - Moving element down with ID:", id);
    moveElementDown(id);
  }, [moveElementDown]);
  
  const handleDragStart = useCallback((id: string) => {
    console.log("BuilderCanvas - Started dragging element with ID:", id);
    setDraggedElementId(id);
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedElementId && id !== draggedElementId) {
      console.log(`BuilderCanvas - Dragging over element ${id}`);
      setDropTargetId(id);
    }
  }, [draggedElementId]);
  
  const handleDragEnd = useCallback(() => {
    console.log("BuilderCanvas - Drag ended, dragged:", draggedElementId, "target:", dropTargetId);
    
    if (draggedElementId && dropTargetId && draggedElementId !== dropTargetId) {
      const sourceIndex = elements.findIndex(el => el.id === draggedElementId);
      const targetIndex = elements.findIndex(el => el.id === dropTargetId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        console.log("BuilderCanvas - Reordering from index", sourceIndex, "to", targetIndex);
        reorderElements(sourceIndex, targetIndex);
        
        toast({
          title: "Elemento reordenado",
          description: "O elemento foi movido para a nova posição."
        });
      }
    }
    
    // Limpar os estados
    setDraggedElementId(null);
    setDropTargetId(null);
    
    // Usar um setTimeout para garantir que a UI atualize após o drag acabar
    setTimeout(() => {
      setRenderKey(prev => prev + 1);
    }, 100);
  }, [draggedElementId, dropTargetId, elements, reorderElements, toast]);
  
  // Add a specific drop handler for elements
  const handleElementDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const elementId = e.dataTransfer.getData("elementId");
    if (!elementId || !dropTargetId || elementId === dropTargetId) {
      return;
    }
    
    const sourceIndex = elements.findIndex(el => el.id === elementId);
    const targetIndex = elements.findIndex(el => el.id === dropTargetId);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      console.log(`BuilderCanvas - Dropping element ${elementId} at position ${targetIndex}`);
      reorderElements(sourceIndex, targetIndex);
      
      toast({
        title: "Elemento reordenado",
        description: "O elemento foi movido para a nova posição."
      });
    }
    
    // Limpar estados
    setDraggedElementId(null);
    setDropTargetId(null);
    
    // Forçar uma atualização da UI
    setTimeout(() => {
      setRenderKey(prev => prev + 1);
    }, 100);
  }, [dropTargetId, elements, reorderElements, toast]);
  
  // Escutar o evento personalizado elementDropped
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const handleElementDropped = (e: CustomEvent) => {
      const { sourceId, targetId } = e.detail;
      console.log(`BuilderCanvas - Custom drop event: ${sourceId} onto ${targetId}`);
      
      if (sourceId && targetId && sourceId !== targetId) {
        const sourceIndex = elements.findIndex(el => el.id === sourceId);
        const targetIndex = elements.findIndex(el => el.id === targetId);
        
        if (sourceIndex !== -1 && targetIndex !== -1) {
          console.log(`BuilderCanvas - Reordering from index ${sourceIndex} to ${targetIndex}`);
          reorderElements(sourceIndex, targetIndex);
          
          toast({
            title: "Elemento reordenado",
            description: "O elemento foi movido para a nova posição."
          });
          
          // Limpar estados
          setDraggedElementId(null);
          setDropTargetId(null);
          
          // Forçar uma atualização da UI após a reordenação
          setTimeout(() => {
            setRenderKey(prev => prev + 1);
          }, 100);
        }
      }
    };
    
    // Adicionar event listener global para dragend para garantir limpeza de estado
    const handleGlobalDragEnd = () => {
      setDraggedElementId(null);
      setDropTargetId(null);
      setIsExternalDragOver(false);
      
      // Forçar uma atualização da UI após qualquer operação de drag
      setTimeout(() => {
        setRenderKey(prev => prev + 1);
      }, 100);
    };
    
    canvasRef.current.addEventListener('elementDropped', handleElementDropped as EventListener);
    document.addEventListener('dragend', handleGlobalDragEnd);
    
    return () => {
      canvasRef.current?.removeEventListener('elementDropped', handleElementDropped as EventListener);
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, [elements, reorderElements, toast]);
  
  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    // Only show the drop indicator for new components, not for reordering
    if (e.dataTransfer.types.includes("componentType") && 
        !e.dataTransfer.types.includes("elementId") && 
        !e.dataTransfer.types.includes("text/plain")) {
      setIsExternalDragOver(true);
    }
  }, []);
  
  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    // Only set to false if we're leaving the canvas, not entering a child element
    if (canvasRef.current && !canvasRef.current.contains(e.relatedTarget as Node)) {
      setIsExternalDragOver(false);
    }
  }, []);
  
  // Add a specific drop handler for new components directly on the canvas
  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drag state
    setIsExternalDragOver(false);
    
    // Get component type from the drop data
    const componentType = e.dataTransfer.getData("componentType");
    
    // If it's for element reordering, don't handle it here
    if (e.dataTransfer.types.includes("elementId") || 
        e.dataTransfer.types.includes("text/plain")) {
      return;
    }
    
    // Only add new component if we have a component type
    if (componentType) {
      console.log("BuilderCanvas - Handling direct drop for new component:", componentType);
      const newElement = addElement(componentType);
      if (newElement && onElementSelect) {
        onElementSelect(newElement);
        
        toast({
          title: "Elemento adicionado",
          description: `Novo elemento ${componentType} adicionado com sucesso.`
        });
        
        // Corrigir a borda branca após adicionar um elemento
        setTimeout(fixCanvasWhiteSpace, 100);
      }
    }
    
    // Forçar atualização da UI
    setTimeout(() => {
      setRenderKey(prev => prev + 1);
      // Chamar novamente após a renderização
      setTimeout(fixCanvasWhiteSpace, 100);
    }, 100);
  }, [addElement, onElementSelect, toast, fixCanvasWhiteSpace]);
  
  // Force re-render when element updates are received - place all effects after all callbacks
  useEffect(() => {
    if (elementUpdates) {
      setRenderKey(prev => prev + 1);
    }
  }, [elementUpdates]);
  
  // Verificar se o canvas está vazio
  const isCanvasEmpty = elements.length === 0;
  
  // Função para validar o formato do logotipo
  const validateLogo = (logo: string | undefined): string | null => {
    if (!logo) return null;
    
    // Verificar se o logo já é uma string base64 válida com prefixo data:image/
    if (logo.startsWith('data:image/')) {
      return logo;
    }
    
    // Tentar corrigir formatos comuns de base64 sem o prefixo
    if (logo.startsWith('/9j/')) {
      console.log("BuilderCanvas - Tentando corrigir formato do logo como JPEG");
      return `data:image/jpeg;base64,${logo}`;
    }
    
    // Se começa com iVBOR, é um PNG (que suporta transparência)
    if (logo.startsWith('iVBOR')) {
      console.log("BuilderCanvas - Tentando corrigir formato do logo como PNG");
      return `data:image/png;base64,${logo}`;
    }
    
    // Caso não seja possível identificar o formato, retornar null
    console.error("BuilderCanvas - Logo não é uma string base64 válida");
    return null;
  };
  
  return (
    <CanvasDropZone 
      onDrop={handleDrop}
      isEmpty={isCanvasEmpty}
    >
      <div 
        ref={canvasRef}
        className={cn(
          "w-full mx-auto rounded-lg relative",
          isMobile ? "max-w-[375px]" : "max-w-[600px]",
          isExternalDragOver && "ring-2 ring-violet-400 ring-dashed bg-violet-50/50"
        )}
        style={{
          backgroundColor: currentFunnel?.settings?.backgroundColor || '#ffffff',
          transition: 'all 0.3s ease',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: isExternalDragOver ? '50px' : '0px',
          minHeight: isCanvasEmpty ? '200px' : 'auto'
        }}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
      >
        {isExternalDragOver && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="bg-white/80 rounded-lg shadow-sm px-4 py-2 text-center">
              <p className="text-violet-600 font-medium">Solte para adicionar aqui</p>
            </div>
          </div>
        )}
        
        {currentFunnel?.settings.showProgressBar && (
          <div className="mb-6">
            {currentFunnel.settings.logo && (
              <>
                {validateLogo(currentFunnel.settings.logo) && (
                  <div className="w-full flex justify-center py-4 mb-2">
                    <img 
                      src={validateLogo(currentFunnel.settings.logo)} 
                      alt="Logo" 
                      className="max-h-14 object-contain"
                      onError={(e) => {
                        console.error("BuilderCanvas - Erro ao carregar logo:", e);
                        // Esconder o elemento em caso de erro
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log("BuilderCanvas - Logo carregado com sucesso");
                      }}
                    />
                  </div>
                )}
              </>
            )}
            <ProgressBar 
              currentStep={currentStep}
              totalSteps={currentFunnel.steps.length}
              primaryColor={currentFunnel.settings.primaryColor}
            />
          </div>
        )}
        <div className="relative" style={{ 
          marginLeft: '-16px', 
          marginRight: '-16px',
          marginBottom: '0'
        }}>
          {displayElements.map((element, index) => {
            // Create a unique key that forces re-render when elements or selections change
            const key = `element-${element.id}-${element.id === selectedElementId ? 'selected' : 'unselected'}-${renderKey}-${index}`;
            
            return (
              <div 
                key={key} 
                className={cn(
                  "relative transition-all",
                  dropTargetId === element.id && "outline outline-2 outline-violet-500 rounded-md shadow-lg"
                )}
                onDragEnter={(e) => handleDragEnter(e, element.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleElementDrop}
                style={{ 
                  marginBottom: '0px',
                  paddingLeft: '16px',
                  paddingRight: '16px'
                }}
              >
                <CanvasElementRenderer
                  element={element}
                  isSelected={element.id === selectedElementId}
                  onSelect={handleElementSelect}
                  onRemove={handleElementRemove}
                  onDuplicate={handleElementDuplicate}
                  onMoveUp={handleElementMoveUp}
                  onMoveDown={handleElementMoveDown}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={element.id === draggedElementId}
                  index={index}
                  totalElements={elements.length}
                />
              </div>
            );
          })}
        </div>
        
        {/* Área visível para arrastar no final do canvas */}
        <div
          className={cn(
            "w-full transition-all py-2",
            isExternalDragOver ? "h-20 opacity-100" : "h-10 opacity-0"
          )}
          style={{
            marginTop: '10px',
            border: isExternalDragOver ? '2px dashed #8b5cf6' : 'none',
            borderRadius: '6px',
            backgroundColor: isExternalDragOver ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
            // Propriedades extras para garantir o comportamento correto
            position: 'relative',
            cursor: 'pointer'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isExternalDragOver && 
                e.dataTransfer.types.includes("componentType") && 
                !e.dataTransfer.types.includes("elementId")) {
              setIsExternalDragOver(true);
            }
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setIsExternalDragOver(false);
          }}
          onDrop={handleCanvasDrop}
        >
          {isExternalDragOver && (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-violet-500 text-sm">Solte para adicionar no final</p>
            </div>
          )}
        </div>
      </div>
    </CanvasDropZone>
  );
};

export default BuilderCanvas;
