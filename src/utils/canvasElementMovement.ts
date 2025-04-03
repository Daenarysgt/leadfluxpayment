
import { CanvasElement } from "@/types/canvasTypes";
import { useToast } from "@/hooks/use-toast";

export const useCanvasElementMovement = (
  elements: CanvasElement[],
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>,
  onElementsChange?: (elements: CanvasElement[]) => void
) => {
  const { toast } = useToast();

  const moveElementUp = (id: string) => {
    const elementIndex = elements.findIndex(el => el.id === id);
    if (elementIndex <= 0) {
      return; // Already at the top
    }

    const updatedElements = [...elements];
    const temp = updatedElements[elementIndex];
    updatedElements[elementIndex] = updatedElements[elementIndex - 1];
    updatedElements[elementIndex - 1] = temp;

    setElements(updatedElements);
    if (onElementsChange) {
      onElementsChange(updatedElements);
    }

    toast({
      title: "Elemento movido",
      description: "O elemento foi movido para cima."
    });
  };

  const moveElementDown = (id: string) => {
    const elementIndex = elements.findIndex(el => el.id === id);
    if (elementIndex === -1 || elementIndex >= elements.length - 1) {
      return; // Already at the bottom or not found
    }

    const updatedElements = [...elements];
    const temp = updatedElements[elementIndex];
    updatedElements[elementIndex] = updatedElements[elementIndex + 1];
    updatedElements[elementIndex + 1] = temp;

    setElements(updatedElements);
    if (onElementsChange) {
      onElementsChange(updatedElements);
    }

    toast({
      title: "Elemento movido",
      description: "O elemento foi movido para baixo."
    });
  };

  const reorderElements = (sourceIndex: number, targetIndex: number) => {
    console.log("useCanvasElementMovement - Reordering elements from", sourceIndex, "to", targetIndex);
    
    if (sourceIndex < 0 || sourceIndex >= elements.length || 
        targetIndex < 0 || targetIndex >= elements.length ||
        sourceIndex === targetIndex) {
      console.error("Invalid source or target index for reordering:", sourceIndex, targetIndex);
      return;
    }
    
    // Create a copy of the elements array
    const updatedElements = [...elements];
    
    // Get the element to move
    const [movedElement] = updatedElements.splice(sourceIndex, 1);
    
    // Insert it at the target position
    updatedElements.splice(targetIndex, 0, movedElement);
    
    console.log("useCanvasElementMovement - Updated elements after reordering:", 
      updatedElements.map(e => ({ id: e.id, type: e.type })));
    
    // Update the state
    setElements(updatedElements);
    
    // Notify parent component about the change
    if (onElementsChange) {
      onElementsChange(updatedElements);
    }
    
    toast({
      title: "Elementos reorganizados",
      description: "A ordem dos elementos foi atualizada."
    });
  };

  return {
    moveElementUp,
    moveElementDown,
    reorderElements
  };
};
