import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BuilderCanvasProps, CanvasElement } from "@/types/canvasTypes";
import { useCanvasElements } from "@/hooks/useCanvasElements";
import CanvasElementRenderer from "@/components/canvas/CanvasElementRenderer";
import CanvasDropZone from "@/components/canvas/CanvasDropZone";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/utils/store";
import ProgressBar from "@/components/funnel-preview/ProgressBar";

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
  
  const { 
    elements, 
    addElement, 
    removeElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    reorderElements
  } = useCanvasElements(initialElements, onElementsChange, elementUpdates, selectedElementId);
  
  // Define all callback hooks consistently at the top level
  const handleDrop = useCallback((componentType: string) => {
    const newElement = addElement(componentType);
    if (newElement && onElementSelect) {
      onElementSelect(newElement);
    }
    
    // Reset drag state
    setIsExternalDragOver(false);
  }, [addElement, onElementSelect]);
  
  const handleElementSelect = useCallback((id: string) => {
    console.log("BuilderCanvas - Selecting element with ID:", id);
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
  }, [elements, onElementSelect]);
  
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
      }
    }
    
    // Forçar atualização da UI
    setTimeout(() => {
      setRenderKey(prev => prev + 1);
    }, 100);
  }, [addElement, onElementSelect, toast]);
  
  // Force re-render when element updates are received - place all effects after all callbacks
  useEffect(() => {
    if (elementUpdates) {
      setRenderKey(prev => prev + 1);
    }
  }, [elementUpdates]);
  
  // Determine if the canvas is truly empty
  const isCanvasEmpty = elements.length === 0;
  
  return (
    <CanvasDropZone 
      onDrop={handleDrop}
      isEmpty={isCanvasEmpty}
    >
      <div 
        ref={canvasRef}
        className={cn(
          "w-full mx-auto pb-20 rounded-lg relative", 
          isMobile ? "max-w-[375px]" : "max-w-[600px]",
          isExternalDragOver && "ring-2 ring-violet-400 ring-dashed bg-violet-50/50"
        )}
        style={{
          backgroundColor: currentFunnel?.settings?.backgroundColor || '#ffffff',
          transition: 'all 0.3s ease'
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
            <ProgressBar 
              currentStep={currentStep}
              totalSteps={currentFunnel.steps.length}
              primaryColor={currentFunnel.settings.primaryColor}
            />
          </div>
        )}
        {elements.map((element, index) => {
          // Create a unique key that forces re-render when elements or selections change
          const key = `element-${element.id}-${element.id === selectedElementId ? 'selected' : 'unselected'}-${renderKey}-${index}`;
          
          return (
            <div 
              key={key} 
              className={cn(
                "relative transition-all",
                dropTargetId === element.id && "border-2 border-violet-500 rounded-md shadow-lg"
              )}
              onDragEnter={(e) => handleDragEnter(e, element.id)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleElementDrop}
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
    </CanvasDropZone>
  );
};

export default BuilderCanvas;
