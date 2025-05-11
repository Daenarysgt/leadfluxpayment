import { useStore } from "@/utils/store";
import { CanvasElement } from "@/types/canvasTypes";
import { useCanvasElementSelection } from "./canvas/useCanvasElementSelection";
import { useCanvasSynchronization } from "./canvas/useCanvasSynchronization";
import { useCanvasElements } from "./useCanvasElements";
import { useCallback } from "react";

export const useBuilderCanvas = () => {
  const { 
    currentFunnel,
    currentStep,
    setCanvasElements: storeSetCanvasElements,
    getCanvasElements: storeGetCanvasElements
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
    saveCurrentStepElements,
    isLoading,
    preventNextReload
  } = useCanvasSynchronization(
    storeSetCanvasElements,
    storeGetCanvasElements,
    currentFunnel,
    currentStep
  );
  
  // Use o hook useCanvasElements com outros hooks
  const {
    elements,
    addElement,
    removeElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    reorderElements,
    undo: handleUndoAction,
    redo: handleRedoAction,
    canUndo,
    canRedo
  } = useCanvasElements(
    localCanvasElements, 
    handleCanvasElementsChange, 
    selectedElement, 
    selectedElement?.id
  );

  // Função para executar o desfazer
  const undo = useCallback(() => {
    const success = handleUndoAction();
    if (success && setSelectedElement) {
      // Limpar a seleção após desfazer
      setSelectedElement(null);
    }
    return success;
  }, [handleUndoAction, setSelectedElement]);

  // Função para executar o refazer
  const redo = useCallback(() => {
    const success = handleRedoAction();
    if (success && setSelectedElement) {
      // Limpar a seleção após refazer
      setSelectedElement(null);
    }
    return success;
  }, [handleRedoAction, setSelectedElement]);

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
    setSelectedElement,
    localCanvasElements,
    canvasKey,
    currentStepIdRef,
    handleElementSelect,
    handleElementUpdate,
    handleCanvasElementsChange,
    handleSave,
    saveCurrentStepElements,
    isLoading,
    preventNextReload,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
