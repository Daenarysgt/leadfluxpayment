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

  // Handle changes to element updates prop
  useEffect(() => {
    if (elementUpdates && isInitialized) {
      const { id, content } = elementUpdates;
      // Avoid endless loops by checking if this is a duplicate update
      if (id !== previousUpdateRef.current.id || 
          JSON.stringify(content) !== JSON.stringify(previousUpdateRef.current.content)) {
        
        previousUpdateRef.current = { id, content };
        
        // Find and update the element
        setElements(prevElements => {
          return prevElements.map(el => {
            if (el.id === id) {
              return updateCanvasElement(el, elementUpdates);
            }
            return el;
          });
        });
      }
    }
  }, [elementUpdates, isInitialized, setElements]);

  // Initialize from props
  useEffect(() => {
    if (!isInitialized && initialElementsRef.current) {
      console.log("useCanvasElements - Initializing with", initialElementsRef.current.length, "elements");
      setElements(initialElementsRef.current);
      setIsInitialized(true);
    }
  }, [isInitialized, setElements]);

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
            // Criar uma cópia profunda para garantir que todas as alterações sejam capturadas
            const elementsCopy = JSON.parse(JSON.stringify(elements));
            onElementsChangeRef.current(elementsCopy);
            
            // Para garantir a persistência completa, forçar mais uma atualização após um delay
            setTimeout(() => {
              if (onElementsChangeRef.current) {
                console.log("useCanvasElements - Garantindo persistência final");
                onElementsChangeRef.current(JSON.parse(JSON.stringify(elements)));
              }
            }, 300);
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
            // Criar uma cópia profunda para garantir que todas as alterações sejam capturadas
            const elementsCopy = JSON.parse(JSON.stringify(elements));
            onElementsChangeRef.current(elementsCopy);
            
            // Para garantir a persistência completa, forçar mais uma atualização após um delay
            setTimeout(() => {
              if (onElementsChangeRef.current) {
                console.log("useCanvasElements - Garantindo persistência final");
                onElementsChangeRef.current(JSON.parse(JSON.stringify(elements)));
              }
            }, 300);
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
