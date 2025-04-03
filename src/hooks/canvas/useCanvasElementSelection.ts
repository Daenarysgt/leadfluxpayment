
import { useState, useCallback } from "react";
import { CanvasElement } from "@/types/canvasTypes";

export const useCanvasElementSelection = () => {
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  
  const handleElementSelect = useCallback((element: CanvasElement | null) => {
    console.log("Builder - Selected element:", element);
    setSelectedElement(element);
  }, []);

  const handleElementUpdate = useCallback((updates: CanvasElement) => {
    console.log("Builder - handling element update:", updates);
    
    if (!updates || !updates.id) {
      console.error("Builder - Update missing ID", updates);
      return;
    }
    
    setSelectedElement(updates);
    
    return updates;
  }, []);

  return {
    selectedElement,
    setSelectedElement,
    handleElementSelect,
    handleElementUpdate
  };
};
