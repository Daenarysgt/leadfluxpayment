import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import StepsSidebar from "@/components/StepsSidebar";
import ElementsSidebar from "@/components/ElementsSidebar";
import ElementConfigSidebar from "@/components/ElementConfigSidebar";
import BuilderCanvas from "@/components/BuilderCanvas";
import BuilderPreview from "@/components/builder/BuilderPreview";
import { CanvasElement } from "@/types/canvasTypes";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BuilderContentProps {
  viewMode: "desktop" | "mobile";
  previewActive: boolean;
  selectedElement: CanvasElement | null;
  localCanvasElements: CanvasElement[];
  canvasKey: number;
  currentStep: number;
  onElementSelect: (element: CanvasElement | null) => void;
  onElementUpdate: (element: CanvasElement) => void;
  onElementsChange: (elements: CanvasElement[]) => void;
  onCloseElementConfig: () => void;
}

const BuilderContent = ({
  viewMode,
  previewActive,
  selectedElement,
  localCanvasElements,
  canvasKey,
  currentStep,
  onElementSelect,
  onElementUpdate,
  onElementsChange,
  onCloseElementConfig
}: BuilderContentProps) => {
  return (
    <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <div className="flex h-full">
            <StepsSidebar />
            <ElementsSidebar />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle className="bg-gray-200 hover:bg-violet-200 transition-colors" />
        
        <ResizablePanel defaultSize={selectedElement ? 40 : 70}>
          {previewActive ? (
            <BuilderPreview isMobile={viewMode === 'mobile'} />
          ) : (
            <ScrollArea className="h-[calc(100vh-64px)]">
              <div className="p-6">
                <BuilderCanvas 
                  key={`canvas-${canvasKey}-${currentStep}`}
                  isMobile={viewMode === 'mobile'} 
                  onElementSelect={onElementSelect}
                  selectedElementId={selectedElement?.id || null}
                  elementUpdates={selectedElement || undefined}
                  elements={localCanvasElements}
                  onElementsChange={onElementsChange}
                />
              </div>
            </ScrollArea>
          )}
        </ResizablePanel>
        
        {selectedElement && !previewActive && (
          <>
            <ResizableHandle withHandle className="bg-gray-200 hover:bg-violet-200 transition-colors" />
            
            <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
              <ElementConfigSidebar 
                selectedElement={selectedElement}
                onUpdate={onElementUpdate}
                onClose={onCloseElementConfig}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default BuilderContent;
