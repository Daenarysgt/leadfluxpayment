import { useState, useEffect, useRef, useCallback } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { getExampleElements } from "@/utils/canvasElementDefaults";
import { useCanvasElementOperations } from "@/utils/canvasElementOperations";
import { useCanvasElementMovement } from "@/utils/canvasElementMovement";
import { updateCanvasElement } from "@/utils/canvasElementUpdates";
import { useHistoryState } from "./useHistoryState";
import { useToast } from "./use-toast";

export const useCanvasElements = (
  initialElements?: CanvasElement[],
  onElementsChange?: (elements: CanvasElement[]) => void,
  elementUpdates?: CanvasElement,
  selectedElementId?: string | null
) => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const initialElementsRef = useRef(initialElements);
  const onElementsChangeRef = useRef(onElementsChange);
  const previousUpdateRef = useRef<{id: string | null, content: any | null}>({id: null, content: null});
  
  // Usar o history state em vez do useState básico
  const {
    state: elements,
    setState: setElements,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistoryState<CanvasElement[]>([]);
  
  // Keep the onElementsChange reference up to date
  useEffect(() => {
    onElementsChangeRef.current = onElementsChange;
  }, [onElementsChange]);
  
  // Initialize elements from props or defaults
  const initializeElements = useCallback(() => {
    // Skip initialization if already done
    if (isInitialized) {
      return;
    }
    
    if (initialElements && initialElements.length > 0) {
      console.log("useCanvasElements - Using provided elements:", 
        initialElements.map(el => ({id: el.id, type: el.type, content: el.content})));
      setElements(initialElements);
      setIsInitialized(true);
    } else {
      const exampleElements = getExampleElements();
      
      console.log("useCanvasElements - Setting initial elements:", exampleElements);
      setElements(exampleElements);
      setIsInitialized(true);
      
      // Only call onElementsChange if it exists and we're setting example elements
      if (onElementsChangeRef.current) {
        console.log("useCanvasElements - Notifying about initial elements");
        onElementsChangeRef.current(exampleElements);
      }
    }
  }, [initialElements, isInitialized, setElements]);

  // Run initialization once on mount or when initial elements change
  useEffect(() => {
    if (!isInitialized || 
        JSON.stringify(initialElementsRef.current) !== JSON.stringify(initialElements)) {
      initialElementsRef.current = initialElements;
      initializeElements();
    }
  }, [initializeElements, initialElements, isInitialized]);

  // Process element updates immediately
  useEffect(() => {
    if (!elementUpdates || !selectedElementId) return;
    
    // Skip if this is the exact same update as before (prevents double processing)
    const currentUpdateString = JSON.stringify(elementUpdates.content);
    const previousUpdateString = JSON.stringify(previousUpdateRef.current.content);
    
    if (previousUpdateRef.current.id === selectedElementId && 
        currentUpdateString === previousUpdateString) {
      return;
    }
    
    console.log("useCanvasElements - Processing update for:", selectedElementId, elementUpdates);
    
    // Store current update for comparison
    previousUpdateRef.current = {
      id: selectedElementId,
      content: elementUpdates.content ? JSON.parse(JSON.stringify(elementUpdates.content)) : null
    };
    
    // Apply the update to the elements immediately
    const updatedElements = updateCanvasElement(elements, selectedElementId, elementUpdates);
    
    // Check if there were actual changes
    if (JSON.stringify(updatedElements) !== JSON.stringify(elements)) {
      console.log("useCanvasElements - Setting updated elements:", 
        updatedElements.map(el => ({id: el.id, type: el.type})));
      
      // Update the state with the new elements
      setElements(updatedElements);
      
      // Notify about the change
      if (onElementsChangeRef.current) {
        console.log("useCanvasElements - Notificando sobre mudanças nos elementos (total: " + 
          updatedElements.length + ")");
        onElementsChangeRef.current(updatedElements);
      }
    } else {
      console.log("useCanvasElements - No changes detected for element with ID:", selectedElementId);
    }
  }, [elementUpdates, selectedElementId, elements, setElements]);

  // Funções para desfazer e refazer com feedback
  const handleUndo = useCallback(() => {
    const result = undo();
    if (result) {
      toast({
        title: "Ação desfeita",
        description: "A última alteração foi desfeita com sucesso."
      });
      
      // Notificar sobre a mudança e garantir que seja sincronizada com o backend
      if (onElementsChangeRef.current) {
        console.log("useCanvasElements - Notificando alterações após desfazer", elements);
        // Importante: Aqui garantimos que a alteração desfeita seja persistida
        onElementsChangeRef.current(elements);
        
        // Forçar uma sincronização adicional após um breve delay para garantir que as alterações visuais sejam capturadas
        setTimeout(() => {
          if (onElementsChangeRef.current) {
            console.log("useCanvasElements - Forçando sincronização adicional após desfazer");
            onElementsChangeRef.current(elements);
          }
        }, 100);
      }
      return true;
    }
    return false;
  }, [undo, toast, elements]);

  const handleRedo = useCallback(() => {
    const result = redo();
    if (result) {
      toast({
        title: "Ação refeita",
        description: "A alteração foi refeita com sucesso."
      });
      
      // Notificar sobre a mudança e garantir que seja sincronizada com o backend
      if (onElementsChangeRef.current) {
        console.log("useCanvasElements - Notificando alterações após refazer", elements);
        // Importante: Aqui garantimos que a alteração refeita seja persistida
        onElementsChangeRef.current(elements);
        
        // Forçar uma sincronização adicional após um breve delay para garantir que as alterações visuais sejam capturadas
        setTimeout(() => {
          if (onElementsChangeRef.current) {
            console.log("useCanvasElements - Forçando sincronização adicional após refazer");
            onElementsChangeRef.current(elements);
          }
        }, 100);
      }
      return true;
    }
    return false;
  }, [redo, toast, elements]);

  // Criar instâncias atualizadas das operações para usar o setElements do histórico
  const { addElement, removeElement, duplicateElement } = useCanvasElementOperations(
    elements, 
    setElements, 
    onElementsChange
  );

  const { moveElementUp, moveElementDown, reorderElements } = useCanvasElementMovement(
    elements, 
    setElements, 
    onElementsChange
  );

  return {
    elements,
    addElement,
    removeElement,
    duplicateElement,
    moveElementUp,
    moveElementDown,
    reorderElements,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo
  };
};
