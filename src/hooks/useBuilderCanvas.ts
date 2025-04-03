
import { useStore } from "@/utils/store";
import { CanvasElement } from "@/types/canvasTypes";
import { useCanvasElementSelection } from "./canvas/useCanvasElementSelection";
import { useCanvasSynchronization } from "./canvas/useCanvasSynchronization";

export const useBuilderCanvas = () => {
  const { 
    currentFunnel,
    currentStep,
    setCanvasElements: storeSetCanvasElements,
    getCanvasElements
  } = useStore();
  
  // Use the selection hook
  const {
    selectedElement,
    setSelectedElement,
    handleElementSelect,
    handleElementUpdate: baseHandleElementUpdate
  } = useCanvasElementSelection();
  
  // Use the synchronization hook
  const {
    localCanvasElements,
    setLocalCanvasElements,
    canvasKey,
    currentStepIdRef,
    handleCanvasElementsChange,
    handleSave,
    saveCurrentStepElements
  } = useCanvasSynchronization(
    storeSetCanvasElements,
    getCanvasElements,
    currentFunnel,
    currentStep
  );
  
  // Enhanced element update function that updates local elements and selected element
  const handleElementUpdate = (updates: CanvasElement) => {
    const updatedElement = baseHandleElementUpdate(updates);
    
    if (updatedElement) {
      setLocalCanvasElements(prevElements => {
        const elementIndex = prevElements.findIndex(el => el.id === updates.id);
        if (elementIndex === -1) {
          console.log("Builder - Adding new element to canvasElements:", updates);
          return [...prevElements, updates];
        } else {
          console.log("Builder - Updating existing element in canvasElements at index", elementIndex);
          const newElements = [...prevElements];
          newElements[elementIndex] = updates;
          return newElements;
        }
      });
    }
    
    return updatedElement;
  };

  return {
    selectedElement,
    localCanvasElements,
    canvasKey,
    currentStepIdRef,
    handleElementSelect,
    handleElementUpdate,
    handleCanvasElementsChange,
    handleSave,
    saveCurrentStepElements,
    setSelectedElement
  };
};
