import { useEffect, useRef, useState } from "react";
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
    setSelectedElement,
    preventNextReload
  } = useBuilderCanvas();

  // Referência ao container principal do Builder
  const builderContainerRef = useRef<HTMLDivElement>(null);
  
  // Estado para armazenar a escala atual
  const [zoomScale] = useState(0.9); // 90% de zoom

  // Registrar hooks globais para permitir comunicação com outras partes da aplicação
  // Inicializado imediatamente para garantir que está disponível antes da duplicação
  // @ts-ignore - Definido dinamicamente
  window.LEADFLUX_APP_HOOKS = {
    ...window.LEADFLUX_APP_HOOKS,
    preventCanvasReload: preventNextReload
  };
  
  // Manter referência atualizada quando o hook mudar
  useEffect(() => {
    // @ts-ignore - Definido dinamicamente
    window.LEADFLUX_APP_HOOKS = {
      ...window.LEADFLUX_APP_HOOKS,
      preventCanvasReload: preventNextReload
    };
    
    console.log("Builder - Hooks registrados no objeto window");
    
    return () => {
      // Limpar quando o componente for desmontado
      // @ts-ignore - Definido dinamicamente
      if (window.LEADFLUX_APP_HOOKS) {
        // @ts-ignore - Definido dinamicamente
        delete window.LEADFLUX_APP_HOOKS.preventCanvasReload;
      }
    };
  }, [preventNextReload]);

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

  // Aplicar zoom de 90% e resolver espaços vazios no rodapé e lateral
  useEffect(() => {
    // Criar um elemento de estilo dedicado
    const styleElement = document.createElement('style');
    styleElement.id = 'builder-zoom-fix';
    
    // CSS que garante o zoom de 90% e evita espaços vazios
    styleElement.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        width: 100vw !important;
        height: 100vh !important;
      }
      
      #root {
        transform: scale(0.90);
        transform-origin: 0 0;
        width: 111.12vw !important;  /* 100/0.9 = ~111.11 */
        height: 111.12vh !important; /* 100/0.9 = ~111.11 */
      }
      
      /* Ajustes para resolver o espaço no rodapé */
      .flex.flex-col.h-screen {
        min-height: 111.12vh !important;
        display: flex !important;
        flex-direction: column !important;
      }
      
      /* Garantir que o conteúdo principal preencha todo o espaço disponível */
      .flex.flex-col.h-screen > div:nth-child(2) {
        flex: 1 !important;
        display: flex !important;
        min-height: calc(111.12vh - 57px) !important;
        height: calc(111.12vh - 57px) !important;
        overflow: hidden !important;
      }
      
      /* Garantir que as sidebars preencham toda a altura */
      .sidebar-left,
      .sidebar-right,
      [class*="sidebar"],
      [class*="canvas"],
      [class*="elements-panel"],
      [class*="steps-panel"] {
        height: 100% !important;
        min-height: calc(111.12vh - 57px) !important;
        max-height: none !important;
        overflow-y: auto !important;
      }
      
      /* Forçar todos os paineis a irem até o fim da tela */
      .flex.flex-col.h-screen > div:nth-child(2) > div {
        height: calc(111.12vh - 57px) !important;
        min-height: calc(111.12vh - 57px) !important;
        overflow-y: auto !important;
      }
      
      /* Correção para o problema da borda branca no final do canvas */
      .ScrollAreaViewport {
        height: auto !important;
        min-height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
      }
      
      /* Garantir que o div do canvas preencha todo o espaço disponível */
      .ScrollAreaViewport > div {
        flex-grow: 1 !important;
        display: flex !important;
        flex-direction: column !important;
      }
      
      /* Impedir que o zoom afete o cálculo de altura das áreas de rolagem */
      [data-radix-scroll-area-viewport] {
        transform: scale(1) !important; /* Anular o efeito de escala para height */
      }
    `;
    
    // Adicionar ao head
    document.head.appendChild(styleElement);
    
    // Aplicar ajustes específicos via JavaScript
    const applySpecificFixes = () => {
      // Encontrar e ajustar os painéis laterais
      const container = document.querySelector('.flex.flex-col.h-screen > div:nth-child(2)') as HTMLElement;
      
      if (container) {
        // Ajustar o container principal
        container.style.height = 'calc(111.12vh - 57px)';
        container.style.minHeight = 'calc(111.12vh - 57px)';
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.overflow = 'hidden';
        
        // Ajustar todos os filhos diretos (painéis)
        Array.from(container.children).forEach((panel: Element) => {
          const panelElement = panel as HTMLElement;
          panelElement.style.height = 'calc(111.12vh - 57px)';
          panelElement.style.minHeight = 'calc(111.12vh - 57px)';
          panelElement.style.overflowY = 'auto';
        });
      }
      
      // Ajustar especificamente as áreas de rolagem para impedir a borda branca
      const viewports = document.querySelectorAll('[data-radix-scroll-area-viewport]');
      viewports.forEach((viewport: Element) => {
        const viewportElement = viewport as HTMLElement;
        viewportElement.style.display = 'flex';
        viewportElement.style.flexDirection = 'column';
        viewportElement.style.minHeight = '100%';
        
        // Garantir que o primeiro filho (div de conteúdo) preencha o espaço disponível
        if (viewportElement.firstElementChild) {
          const contentDiv = viewportElement.firstElementChild as HTMLElement;
          contentDiv.style.flexGrow = '1';
          contentDiv.style.display = 'flex';
          contentDiv.style.flexDirection = 'column';
        }
      });
    };
    
    // Executar após um pequeno delay para garantir que o DOM esteja pronto
    setTimeout(applySpecificFixes, 100);
    // Executar também depois de 500ms para maior garantia
    setTimeout(applySpecificFixes, 500);
    
    // Limpar ao desmontar
    return () => {
      const styleToRemove = document.getElementById('builder-zoom-fix');
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
