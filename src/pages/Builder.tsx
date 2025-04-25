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
        overflow: auto !important;
        width: 100vw !important;
        height: 100vh !important;
      }
      
      #root {
        transform: scale(0.90);
        transform-origin: 0 0;
        width: 111.12vw !important;  /* 100/0.9 = ~111.11 */
        height: 111.12vh !important; /* 100/0.9 = ~111.11 */
        overflow: hidden !important;
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
        min-height: calc(111.12vh - 64px) !important;
        height: calc(111.12vh - 64px) !important;
        overflow: hidden !important;
      }
      
      /* Garantir que as sidebars e scrolls funcionem corretamente */
      [data-radix-scroll-area-viewport] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        z-index: 0 !important;
      }
      
      /* Prevenir qualquer overlay não intencional */
      [data-radix-scroll-area-viewport]:after {
        display: none !important;
      }
      
      /* Garantir que nenhum elemento se sobreponha ao conteúdo principal */
      .absolute.inset-0 {
        z-index: 10;
      }
      
      /* Prevenir overlays não intencionais */
      .absolute.bottom-0.left-0.right-0 {
        z-index: auto !important;
        position: relative !important;
      }
      
      /* Corrigir o rodapé cinza */
      body:after {
        display: none !important;
      }
      
      .flex.flex-col.h-screen:after {
        display: none !important;
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
        container.style.height = 'calc(111.12vh - 64px)';
        container.style.minHeight = 'calc(111.12vh - 64px)';
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.overflow = 'hidden';
      }
      
      // Adicionar listener para garantir scroll sempre disponível
      const ensureScrollWorking = () => {
        const viewports = document.querySelectorAll('[data-radix-scroll-area-viewport]');
        viewports.forEach(viewport => {
          const viewportElement = viewport as HTMLElement;
          viewportElement.style.overflowY = 'auto';
          viewportElement.style.overflowX = 'hidden';
        });
      };
      
      // Aplicar ajustes a cada 500ms para garantir que não sejam sobrescritos
      const scrollInterval = setInterval(ensureScrollWorking, 500);
      
      // Remover overlays não intencionais
      const removeOverlays = () => {
        const overlays = document.querySelectorAll('body:after, .flex.flex-col.h-screen:after');
        overlays.forEach(overlay => {
          const el = overlay as HTMLElement;
          if (el) el.style.display = 'none';
        });
      };
      
      // Executar regularmente para garantir consistência
      const overlayInterval = setInterval(removeOverlays, 1000);
      
      // Retornar função de limpeza dos intervalos
      return () => {
        clearInterval(scrollInterval);
        clearInterval(overlayInterval);
      };
    };
    
    // Executar após um pequeno delay para garantir que o DOM esteja pronto
    const cleanup = setTimeout(() => {
      const cleanupFn = applySpecificFixes();
      return () => {
        if (cleanupFn) cleanupFn();
      };
    }, 100);
    
    // Limpar ao desmontar
    return () => {
      clearTimeout(cleanup);
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
