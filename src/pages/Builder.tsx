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

  // Aplicar zoom para o Builder
  useEffect(() => {
    // Criar um elemento de estilo específico para o zoom
    const styleElement = document.createElement('style');
    styleElement.setAttribute('id', 'builder-zoom-style');
    
    // Adicionar CSS para controlar o zoom apenas no Builder
    styleElement.innerHTML = `
      #builderRoot {
        transform: scale(0.9);
        transform-origin: center top;
        margin: 0 auto;
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      body {
        overflow: hidden;
        height: 100vh;
        margin: 0;
        padding: 0;
      }
    `;
    
    // Adicionar o estilo ao head
    document.head.appendChild(styleElement);
    
    // Também adicionar um ID ao container principal para que o CSS possa selecioná-lo
    if (builderContainerRef.current) {
      builderContainerRef.current.id = 'builderRoot';
    }
    
    // Remover o estilo quando o componente for desmontado
    return () => {
      const styleToRemove = document.getElementById('builder-zoom-style');
      if (styleToRemove) {
        styleToRemove.remove();
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
