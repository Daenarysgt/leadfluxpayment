import { useStore } from "@/utils/store";
import { CanvasElement } from "@/types/canvasTypes";
import { useCanvasElementSelection } from "./canvas/useCanvasElementSelection";
import { useCanvasSynchronization } from "./canvas/useCanvasSynchronization";
import { useCanvasElements } from "./useCanvasElements";
import { useCallback, useState, useEffect } from "react";

export const useBuilderCanvas = () => {
  const { 
    currentFunnel,
    currentStep,
    setCanvasElements: storeSetCanvasElements,
    getCanvasElements: storeGetCanvasElements
  } = useStore();
  
  // Estados locais para controlar undo/redo
  const [canUndoState, setCanUndoState] = useState(false);
  const [canRedoState, setCanRedoState] = useState(false);
  
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
    canUndo: canUndoFromElements,
    canRedo: canRedoFromElements
  } = useCanvasElements(
    localCanvasElements, 
    handleCanvasElementsChange, 
    selectedElement, 
    selectedElement?.id
  );
  
  // Atualizar os estados locais quando os estados do useCanvasElements mudarem
  useEffect(() => {
    setCanUndoState(canUndoFromElements);
    setCanRedoState(canRedoFromElements);
    console.log(`BuilderCanvas - Atualizando estados de undo/redo: canUndo=${canUndoFromElements}, canRedo=${canRedoFromElements}`);
  }, [canUndoFromElements, canRedoFromElements, localCanvasElements]);

  // Função para executar o desfazer
  const undo = useCallback(() => {
    const success = handleUndoAction();
    if (success && setSelectedElement) {
      // Limpar a seleção após desfazer
      setSelectedElement(null);
      
      // Forçar atualização dos estados
      setTimeout(() => {
        setCanUndoState(canUndoFromElements);
        setCanRedoState(true); // Se pudemos desfazer, podemos refazer
      }, 0);
    }
    return success;
  }, [handleUndoAction, setSelectedElement, canUndoFromElements]);

  // Função para executar o refazer
  const redo = useCallback(() => {
    const success = handleRedoAction();
    if (success && setSelectedElement) {
      // Limpar a seleção após refazer
      setSelectedElement(null);
      
      // Forçar atualização dos estados
      setTimeout(() => {
        setCanUndoState(true); // Se pudemos refazer, podemos desfazer
        setCanRedoState(canRedoFromElements);
      }, 0);
    }
    return success;
  }, [handleRedoAction, setSelectedElement, canRedoFromElements]);

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
      
      // Atualizar estados de undo/redo após uma modificação
      setTimeout(() => {
        setCanUndoState(true); // Após uma atualização, sempre pode desfazer
        setCanRedoState(false); // Após uma atualização, não pode refazer
      }, 0);
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
    canUndo: canUndoState,
    canRedo: canRedoState
  };
};
