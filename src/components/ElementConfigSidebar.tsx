import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CanvasElement } from "@/types/canvasTypes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useElementConfig } from "@/hooks/useElementConfig";
import ConfigPanelRenderer from "./element-configs/ConfigPanelRenderer";
import { getElementTitle } from "@/utils/elementUtils";

// Define the interface
interface ElementConfigSidebarProps {
  selectedElement: CanvasElement | null;
  onUpdate: (element: CanvasElement) => void;
  onClose: () => void;
}

const ElementConfigSidebar = ({ selectedElement, onUpdate, onClose }: ElementConfigSidebarProps) => {
  const { isOpen, selectedElementCopy, handleUpdate } = useElementConfig(selectedElement, onUpdate);

  if (!selectedElement || !isOpen || !selectedElementCopy) {
    return null;
  }

  return (
    <div className="h-screen w-full border-l bg-white shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h3 className="font-medium">Configurar {getElementTitle(selectedElement.type)}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-4 py-3">
          <ConfigPanelRenderer 
            element={selectedElementCopy} 
            onUpdate={handleUpdate} 
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ElementConfigSidebar;
