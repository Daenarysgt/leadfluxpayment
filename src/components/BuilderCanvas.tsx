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
      }
    }
    
    setDraggedElementId(null);
    setDropTargetId(null);
  }, [draggedElementId, dropTargetId, elements, reorderElements]);
  
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
    
    setDraggedElementId(null);
    setDropTargetId(null);
  }, [dropTargetId, elements, reorderElements, toast]);
  
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
          "w-full mx-auto pb-20 rounded-lg", 
          isMobile ? "max-w-[375px]" : "max-w-[600px]"
        )}
        style={{
          backgroundColor: currentFunnel?.settings?.backgroundColor || '#ffffff',
          transition: 'background-color 0.3s ease'
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleElementDrop}
      >
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
