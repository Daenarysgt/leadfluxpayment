import { useCallback, useRef, useState, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";
import { useToast } from "@/hooks/use-toast";

export const useCanvasSynchronization = (
  storeSetCanvasElements: (stepId: string, elements: CanvasElement[]) => void,
  storeGetCanvasElements: (stepId: string) => Promise<CanvasElement[]>,
  currentFunnel: any,
  currentStep: number
) => {
  const { toast } = useToast();
  const [localCanvasElements, setLocalCanvasElements] = useState<CanvasElement[]>([]);
  const [canvasKey, setCanvasKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const syncingRef = useRef(false);
  const currentStepIdRef = useRef<string | null>(null);
  const elementsSyncedRef = useRef(false);
  const lastSavedElementsRef = useRef<{stepId: string, elements: CanvasElement[]}>({stepId: '', elements: []});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingCanvasRef = useRef(false);
  const preventReloadRef = useRef(false);

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
    
    if (stepId === currentStepIdRef.current && localCanvasElements.length > 0) {
      console.log(`Builder - Já estamos visualizando o step ${stepId} com ${localCanvasElements.length} elementos`);
      return;
    }
    
    const currentStepObj = currentFunnel.steps[currentStep];
    const hasElementsInState = currentStepObj && 
                              currentStepObj.canvasElements && 
                              Array.isArray(currentStepObj.canvasElements) && 
                              currentStepObj.canvasElements.length > 0;
    
    const hasPreloadedElements = window.preloadedCanvasElements && window.preloadedCanvasElements[stepId];
    
    if (stepId !== currentStepIdRef.current || preventReloadRef.current) {
      console.log(`Builder - Loading canvas elements for step ${currentStep} (${stepId})`);
      
      isUpdatingCanvasRef.current = true;
      setIsLoading(true);
      
      if (preventReloadRef.current) {
        console.log(`Builder - Prevenindo recarregamento, usando elementos existentes`);
        preventReloadRef.current = false;
      }
      
      (async () => {
        try {
          if (hasElementsInState) {
            console.log(`Builder - Usando ${currentStepObj.canvasElements.length} elementos existentes no state do step ${stepId}`);
            
            const elementsCopy = JSON.parse(JSON.stringify(currentStepObj.canvasElements));
            setLocalCanvasElements(elementsCopy);
            currentStepIdRef.current = stepId;
            setCanvasKey(prev => prev + 1);
            elementsSyncedRef.current = true;
            
            lastSavedElementsRef.current = {
              stepId: stepId,
              elements: elementsCopy
            };
            return;
          }
          
          const elements = await storeGetCanvasElements(stepId);
          console.log(`Builder - Retrieved ${elements ? elements.length : 0} canvas elements for step ${stepId}`);
          
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
        } catch (error) {
          console.error('Erro ao carregar elementos do canvas:', error);
          setLocalCanvasElements([]);
        } finally {
          setTimeout(() => {
            isUpdatingCanvasRef.current = false;
            setIsLoading(false);
          }, 200);
        }
      })();
    }
  }, [currentFunnel, currentStep, storeGetCanvasElements, saveCurrentStepElements]);
  
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

  const preventNextReload = useCallback(() => {
    preventReloadRef.current = true;
    console.log(`Builder - Marcando para previnir próximo recarregamento`);
  }, []);

  return {
    localCanvasElements,
    setLocalCanvasElements,
    canvasKey,
    currentStepIdRef,
    handleCanvasElementsChange,
    handleSave,
    saveCurrentStepElements,
    isUpdatingCanvasRef,
    isLoading,
    preventNextReload
  };
};
