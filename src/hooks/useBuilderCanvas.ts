import { useStore } from "@/utils/store";
import { CanvasElement } from "@/types/canvasTypes";
import { useCanvasElementSelection } from "./canvas/useCanvasElementSelection";
import { useCanvasSynchronization } from "./canvas/useCanvasSynchronization";
import { useCanvasElements } from "./useCanvasElements";
import { useCallback, useEffect } from "react";

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

  // Monitorar mudanças nos estados de undo/redo
  useEffect(() => {
    console.log(`BuilderCanvas - Undo/Redo state changed: canUndo=${canUndo}, canRedo=${canRedo}`);
  }, [canUndo, canRedo]);

  // Função para executar o desfazer
  const undo = useCallback(() => {
    console.log("BuilderCanvas - Attempting undo operation");
    const success = handleUndoAction();
    
    if (success) {
      console.log("BuilderCanvas - Undo successful, clearing selection");
      
      // Limpar a seleção após desfazer
      if (setSelectedElement) {
        setSelectedElement(null);
      }
      
      // Forçar sincronização imediata com o banco de dados
      if (currentStepIdRef.current) {
        setTimeout(() => {
          console.log("BuilderCanvas - Forcing database synchronization after undo");
          storeSetCanvasElements(currentStepIdRef.current!, elements);
        }, 10);
      }
    } else {
      console.log("BuilderCanvas - Undo failed or no more actions to undo");
    }
    
    return success;
  }, [handleUndoAction, setSelectedElement, currentStepIdRef, storeSetCanvasElements, elements]);

  // Função para executar o refazer
  const redo = useCallback(() => {
    console.log("BuilderCanvas - Attempting redo operation");
    const success = handleRedoAction();
    
    if (success) {
      console.log("BuilderCanvas - Redo successful, clearing selection");
      
      // Limpar a seleção após refazer
      if (setSelectedElement) {
        setSelectedElement(null);
      }
      
      // Forçar sincronização imediata com o banco de dados
      if (currentStepIdRef.current) {
        setTimeout(() => {
          console.log("BuilderCanvas - Forcing database synchronization after redo");
          storeSetCanvasElements(currentStepIdRef.current!, elements);
        }, 10);
      }
    } else {
      console.log("BuilderCanvas - Redo failed or no more actions to redo");
    }
    
    return success;
  }, [handleRedoAction, setSelectedElement, currentStepIdRef, storeSetCanvasElements, elements]);

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
