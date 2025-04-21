import { useEffect, useRef } from "react";
import { useStore } from "@/utils/store";
import { useBuilderCanvas } from "@/hooks/useBuilderCanvas";
import { useBuilderViewMode } from "@/hooks/useBuilderViewMode";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import BuilderHeader from "@/components/builder/BuilderHeader";
import BuilderContent from "@/components/builder/BuilderContent";
import BuilderEmptyState from "@/components/builder/BuilderEmptyState";

const Builder = () => {
  const { toast } = useToast();
  const { funnelId } = useParams<{ funnelId: string }>();
  const { 
    currentFunnel,
    currentStep,
    setCurrentStep,
    funnels,
    createFunnel,
    setCurrentFunnel
  } = useStore();
  
  const {
    viewMode,
    setViewMode,
    previewActive,
    togglePreview,
    openFullPreview
  } = useBuilderViewMode();
  
  const {
    selectedElement,
    localCanvasElements,
    canvasKey,
    handleElementSelect,
    handleElementUpdate,
    handleCanvasElementsChange,
    handleSave,
    saveCurrentStepElements,
    setSelectedElement
  } = useBuilderCanvas();

  // Referência ao container principal do Builder
  const builderContainerRef = useRef<HTMLDivElement>(null);

  // Initialize funnel if none is selected
  useEffect(() => {
    if (funnelId && (!currentFunnel || currentFunnel.id !== funnelId)) {
      console.log(`Builder - Carregando funil ${funnelId} via setCurrentFunnel`);
      setCurrentFunnel(funnelId);
      
      // Forçar a limpar o elemento selecionado
      if (setSelectedElement) {
        setSelectedElement(null);
      }
    } else if (!currentFunnel) {
      if (funnels.length > 0) {
        console.log(`Builder - Usando primeiro funil disponível: ${funnels[0].id}`);
        setCurrentFunnel(funnels[0].id);
      } else {
        console.log(`Builder - Criando novo funil`);
        createFunnel("New Funnel");
        toast({
          title: "Funil criado automaticamente",
          description: "Um novo funil foi criado para você começar",
        });
      }
    } else {
      console.log(`Builder - Funil já carregado: ${currentFunnel.id}`);
    }
  }, [currentFunnel, funnels, setCurrentFunnel, createFunnel, toast, funnelId, setSelectedElement]);
  
  // Reset selected element when step changes
  useEffect(() => {
    setSelectedElement(null);
  }, [currentStep, setSelectedElement]);

  // Aplicar zoom de 90% apenas na página do Builder
  useEffect(() => {
    const applyZoom = () => {
      if (builderContainerRef.current) {
        // Usar CSS transform para o container do Builder
        builderContainerRef.current.style.transform = "scale(0.9)";
        builderContainerRef.current.style.transformOrigin = "top left";
        builderContainerRef.current.style.width = "111.11%"; // Compensar a escala
        builderContainerRef.current.style.height = "111.11%";
      }
    };

    applyZoom();

    // Reestabelecer escala quando o componente for desmontado
    return () => {
      if (builderContainerRef.current) {
        builderContainerRef.current.style.transform = "";
        builderContainerRef.current.style.transformOrigin = "";
        builderContainerRef.current.style.width = "";
        builderContainerRef.current.style.height = "";
      }
    };
  }, []);

  if (!currentFunnel) {
    return <BuilderEmptyState />;
  }

  const handleOpenFullPreview = () => {
    openFullPreview(saveCurrentStepElements);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50" ref={builderContainerRef}>
      <BuilderHeader 
        funnelName={currentFunnel.name}
        funnelId={currentFunnel.id}
        viewMode={viewMode}
        previewActive={previewActive}
        onTogglePreview={togglePreview}
        onViewModeChange={setViewMode}
        onSave={handleSave}
        onOpenFullPreview={handleOpenFullPreview}
      />
      
      <BuilderContent
        viewMode={viewMode}
        previewActive={previewActive}
        selectedElement={selectedElement}
        localCanvasElements={localCanvasElements}
        canvasKey={canvasKey}
        currentStep={currentStep}
        onElementSelect={handleElementSelect}
        onElementUpdate={handleElementUpdate}
        onElementsChange={handleCanvasElementsChange}
        onCloseElementConfig={() => setSelectedElement(null)}
      />
    </div>
  );
};

export default Builder;
