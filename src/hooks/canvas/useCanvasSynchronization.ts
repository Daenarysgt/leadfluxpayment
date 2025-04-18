
import { useCallback, useRef, useState, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { useToast } from "@/hooks/use-toast";

export const useCanvasSynchronization = (
  storeSetCanvasElements: (stepId: string, elements: CanvasElement[]) => void,
  getCanvasElements: (stepId: string) => CanvasElement[],
  currentFunnel: any,
  currentStep: number
) => {
  const { toast } = useToast();
  const [localCanvasElements, setLocalCanvasElements] = useState<CanvasElement[]>([]);
  const [canvasKey, setCanvasKey] = useState(0);
  
  const syncingRef = useRef(false);
  const currentStepIdRef = useRef<string | null>(null);
  const elementsSyncedRef = useRef(false);
  const lastSavedElementsRef = useRef<{stepId: string, elements: CanvasElement[]}>({stepId: '', elements: []});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingCanvasRef = useRef(false);

  const handleCanvasElementsChange = useCallback((elements: CanvasElement[]) => {
    console.log(`Builder - Canvas elements updated: ${elements.length} elements`);
    
    if (isUpdatingCanvasRef.current) {
      return;
    }
    
    setLocalCanvasElements(prevElements => {
      if (JSON.stringify(prevElements) !== JSON.stringify(elements)) {
        return elements;
      }
      return prevElements;
    });
    
    elementsSyncedRef.current = true;
  }, []);

  const saveCurrentStepElements = useCallback(() => {
    if (!currentFunnel || syncingRef.current || isUpdatingCanvasRef.current) return;
    
    const currentStepId = currentStepIdRef.current;
    if (currentStepId && localCanvasElements.length > 0) {
      console.log(`Builder - Explicitly saving ${localCanvasElements.length} elements for step ${currentStepId} before switching`);
      
      syncingRef.current = true;
      
      try {
        const elementsCopy = JSON.parse(JSON.stringify(localCanvasElements));
        storeSetCanvasElements(currentStepId, elementsCopy);
        
        lastSavedElementsRef.current = {
          stepId: currentStepId,
          elements: elementsCopy
        };
      } finally {
        setTimeout(() => {
          syncingRef.current = false;
        }, 200);
      }
    }
  }, [currentFunnel, localCanvasElements, storeSetCanvasElements]);

  const handleSave = useCallback(() => {
    if (currentFunnel && currentStepIdRef.current) {
      console.log(`Builder - Forcing save of ${localCanvasElements.length} canvas elements for step ${currentStep}`);
      
      const elementsCopy = JSON.parse(JSON.stringify(localCanvasElements));
      storeSetCanvasElements(currentStepIdRef.current, elementsCopy);
      
      lastSavedElementsRef.current = {
        stepId: currentStepIdRef.current,
        elements: elementsCopy
      };
      
      toast({
        title: "Funil salvo",
        description: "Todas as alterações foram salvas com sucesso.",
      });
    }
  }, [currentFunnel, currentStep, localCanvasElements, storeSetCanvasElements, toast]);

  // Effect to load canvas elements when step changes
  useEffect(() => {
    if (!currentFunnel) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    if (currentStepIdRef.current && currentStepIdRef.current !== currentFunnel.steps[currentStep]?.id) {
      saveCurrentStepElements();
    }
    
    const stepId = currentFunnel.steps[currentStep]?.id;
    if (!stepId) return;
    
    if (stepId !== currentStepIdRef.current) {
      console.log(`Builder - Loading canvas elements for step ${currentStep} (${stepId})`);
      
      isUpdatingCanvasRef.current = true;
      
      try {
        const elements = getCanvasElements(stepId);
        const elementsCopy = elements && elements.length > 0 
          ? JSON.parse(JSON.stringify(elements))
          : [];
        
        setLocalCanvasElements(elementsCopy);
        currentStepIdRef.current = stepId;
        
        setCanvasKey(prev => prev + 1);
        
        elementsSyncedRef.current = true;
        
        lastSavedElementsRef.current = {
          stepId: stepId,
          elements: elementsCopy
        };
      } finally {
        setTimeout(() => {
          isUpdatingCanvasRef.current = false;
        }, 200);
      }
    }
  }, [currentFunnel, currentStep, getCanvasElements, saveCurrentStepElements]);
  
  // Effect to auto-save changes
  useEffect(() => {
    if (!currentFunnel || !elementsSyncedRef.current || syncingRef.current || isUpdatingCanvasRef.current) {
      return;
    }
    
    const currentStepId = currentFunnel.steps[currentStep]?.id;
    if (!currentStepId || currentStepId !== currentStepIdRef.current) {
      return;
    }
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    const lastSaved = lastSavedElementsRef.current;
    const needsSaving = lastSaved.stepId !== currentStepId || 
                        JSON.stringify(lastSaved.elements) !== JSON.stringify(localCanvasElements);
    
    if (needsSaving) {
      console.log(`Builder - Elements changed, scheduling save for step ${currentStepId}`);
      
      saveTimeoutRef.current = setTimeout(() => {
        if (syncingRef.current || isUpdatingCanvasRef.current) {
          return;
        }
        
        try {
          syncingRef.current = true;
          
          const elementsCopy = JSON.parse(JSON.stringify(localCanvasElements));
          storeSetCanvasElements(currentStepId, elementsCopy);
          
          lastSavedElementsRef.current = {
            stepId: currentStepId,
            elements: elementsCopy
          };
          
          console.log(`Builder - Saved ${elementsCopy.length} elements for step ${currentStepId}`);
        } finally {
          setTimeout(() => {
            syncingRef.current = false;
            saveTimeoutRef.current = null;
          }, 200);
        }
      }, 500);
      
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
      };
    }
  }, [localCanvasElements, currentFunnel, currentStep, storeSetCanvasElements]);

  return {
    localCanvasElements,
    setLocalCanvasElements,
    canvasKey,
    currentStepIdRef,
    handleCanvasElementsChange,
    handleSave,
    saveCurrentStepElements,
    isUpdatingCanvasRef
  };
};
