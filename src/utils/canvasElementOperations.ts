import { CanvasElement } from "@/types/canvasTypes";
import { getDefaultContent } from "./canvasElementDefaults";
import { useToast } from "@/hooks/use-toast";

export const useCanvasElementOperations = (
  elements: CanvasElement[],
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>,
  onElementsChange?: (elements: CanvasElement[]) => void
) => {
  const { toast } = useToast();

  const addElement = (componentType: string, targetIndex?: number) => {
    const newElement: CanvasElement = {
      id: crypto.randomUUID(),
      type: componentType,
      content: getDefaultContent(componentType)
    };
    
    console.log("useCanvasElements - Adding new element:", newElement, targetIndex !== undefined ? `at index ${targetIndex}` : "at the end");
    
    // Se um índice alvo foi fornecido, inserir o elemento nessa posição, caso contrário adicionar ao final
    let updatedElements;
    if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= elements.length) {
      updatedElements = [...elements];
      updatedElements.splice(targetIndex, 0, newElement);
    } else {
      updatedElements = [...elements, newElement];
    }
    
    setElements(updatedElements);
    if (onElementsChange) {
      onElementsChange(updatedElements);
    }
    
    toast({
      title: "Elemento adicionado",
      description: `Elemento adicionado ao canvas com sucesso.`,
    });

    return newElement;
  };

  const removeElement = (id: string) => {
    console.log("useCanvasElements - Removing element with ID:", id);
    const updatedElements = elements.filter(el => el.id !== id);
    setElements(updatedElements);
    if (onElementsChange) {
      onElementsChange(updatedElements);
    }
    
    toast({
      title: "Elemento removido",
      description: "O elemento foi removido do canvas.",
    });

    return updatedElements;
  };

  const duplicateElement = (id: string) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (!elementToDuplicate) {
      console.error("Element not found for duplication:", id);
      return null;
    }

    const newElement: CanvasElement = {
      ...JSON.parse(JSON.stringify(elementToDuplicate)),
      id: crypto.randomUUID()
    };

    console.log("useCanvasElements - Duplicating element:", newElement);
    const elementIndex = elements.findIndex(el => el.id === id);
    const updatedElements = [...elements];
    updatedElements.splice(elementIndex + 1, 0, newElement);
    
    setElements(updatedElements);
    if (onElementsChange) {
      onElementsChange(updatedElements);
    }

    return newElement;
  };

  return {
    addElement,
    removeElement,
    duplicateElement
  };
};
