import { useState, useEffect } from "react";
import { CanvasElement } from "@/types/canvasTypes";

interface CanvasConfigProps {
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  isInitialLoad?: boolean;
  setIsCanvasDirty?: (dirty: boolean) => void;
}

const CanvasConfig = ({ 
  elements, 
  setElements, 
  isInitialLoad = false, 
  setIsCanvasDirty 
}: CanvasConfigProps) => {
  
  const handleUpdateElement = (id: string, data: any) => {
    setElements((prevElements) => {
      return prevElements.map((el) => {
        if (el.id === id) {
          // Mescla os dados para preservar outros campos do elemento
          return {
            ...el,
            content: {
              ...el.content,
              ...data,
              style: {
                ...el.content?.style,
                ...data.style
              }
            }
          };
        }
        return el;
      });
    });
    
    // Salvar automaticamente após atualização
    if (!isInitialLoad && setIsCanvasDirty) {
      setIsCanvasDirty(true);
    }
  };
  
  return {
    handleUpdateElement
  };
};

export default CanvasConfig; 