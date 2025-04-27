import { useEffect, useCallback } from 'react';

// Este hook gerencia o recálculo de altura do canvas para evitar a borda branca
export const useCanvasResize = () => {
  // Função para detectar e corrigir o problema da borda branca
  const fixCanvasWhiteSpace = useCallback(() => {
    // Selecionar os elementos principais relacionados ao canvas
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    const canvasContainer = document.querySelector('.ScrollAreaViewport > div');
    const canvasElements = document.querySelectorAll('[class*="canvas"] > div');
    
    if (viewport && canvasContainer) {
      // Forçar o viewport a ter altura automática e flex para se expandir corretamente
      const viewportEl = viewport as HTMLElement;
      viewportEl.style.height = 'auto';
      viewportEl.style.minHeight = '100%';
      viewportEl.style.display = 'flex';
      viewportEl.style.flexDirection = 'column';
      
      // Garantir que o container do canvas tenha altura automática
      const containerEl = canvasContainer as HTMLElement;
      containerEl.style.flexGrow = '1';
      containerEl.style.display = 'flex';
      containerEl.style.flexDirection = 'column';
      
      // Ajustar qualquer 'padding-bottom' excessivo que possa estar causando o espaço em branco
      // Mas preservar um pequeno padding para permitir o drag and drop
      canvasElements.forEach((element) => {
        const el = element as HTMLElement;
        const paddingBottom = parseInt(getComputedStyle(el).paddingBottom, 10);
        
        // Se o padding-bottom for excessivo (mais de 60px), reduzir para um valor razoável
        if (paddingBottom > 60) {
          el.style.paddingBottom = '60px'; // Manter espaço suficiente para drag-and-drop
        } else if (paddingBottom === 0) {
          // Garantir um espaço mínimo para permitir drag-and-drop
          el.style.paddingBottom = '20px';
        }
      });
      
      // Garantir que a área de arrastar esteja visível
      const dropArea = document.querySelector('[class*="canvas"] > div:last-child');
      if (dropArea) {
        const dropAreaEl = dropArea as HTMLElement;
        dropAreaEl.style.visibility = 'visible';
        dropAreaEl.style.opacity = '1';
        dropAreaEl.style.pointerEvents = 'auto';
      }
      
      // Sincronizar os estilos entre builder e preview
      syncBuilderWithPreview();
    }
  }, []);
  
  // Nova função para sincronizar estilos entre builder e preview
  const syncBuilderWithPreview = useCallback(() => {
    // Selecionar elementos do builder e da visualização
    const builderCanvas = document.querySelector('.w-full.mx-auto.rounded-lg.relative');
    const previewContainer = document.querySelector('[class*="BuilderPreview"] > div');
    
    if (builderCanvas && previewContainer) {
      const builderEl = builderCanvas as HTMLElement;
      const previewEl = previewContainer as HTMLElement;
      
      // Verificar se a visualização está ativa
      const isPreviewActive = document.querySelector('[class*="BuilderPreview"]');
      if (!isPreviewActive) return;
      
      // Sincronizar estilos básicos
      previewEl.style.padding = getComputedStyle(builderEl).padding;
      previewEl.style.borderRadius = getComputedStyle(builderEl).borderRadius;
      
      // Sincronizar largura em mobile
      const isMobile = document.querySelector('button[class*="text-violet-700"]')?.textContent?.includes('mobile');
      if (isMobile) {
        // Obter a largura do container do builder para mobile
        const builderWidth = builderEl.getBoundingClientRect().width;
        previewEl.style.width = `${builderWidth}px`;
        previewEl.style.maxWidth = `${builderWidth}px`;
      }
      
      // Sincronizar elementos dentro do canvas
      const builderElements = builderEl.querySelectorAll('.relative');
      const previewElements = previewEl.querySelectorAll('[class*="canvas-element"]');
      
      if (builderElements.length > 0 && previewElements.length > 0) {
        // Apenas aplicar estilos básicos para garantir consistência
        builderElements.forEach((element, index) => {
          if (index < previewElements.length) {
            const builderItem = element as HTMLElement;
            const previewItem = previewElements[index] as HTMLElement;
            
            // Sincronizar margens e padding
            previewItem.style.marginBottom = getComputedStyle(builderItem).marginBottom;
            previewItem.style.paddingLeft = getComputedStyle(builderItem).paddingLeft;
            previewItem.style.paddingRight = getComputedStyle(builderItem).paddingRight;
          }
        });
      }
    }
  }, []);
  
  // Função para observar mudanças na altura do canvas
  const setupResizeObserver = useCallback(() => {
    // Verificar se o observer já existe e remover
    if (window.canvasResizeObserver) {
      window.canvasResizeObserver.disconnect();
    }
    
    // Criar um novo MutationObserver para detectar mudanças no DOM do canvas
    const observer = new MutationObserver((mutations) => {
      // Verificar se alguma mutação adicionou ou removeu nós
      const hasStructuralChanges = mutations.some(mutation => 
        mutation.type === 'childList' || 
        mutation.type === 'attributes' && 
        (mutation.attributeName === 'style' || mutation.attributeName === 'class')
      );
      
      if (hasStructuralChanges) {
        // Se houve mudanças estruturais, chamar o fix
        fixCanvasWhiteSpace();
      }
    });
    
    // Observar os painéis principais
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    const canvasContainer = document.querySelector('.w-full.mx-auto.rounded-lg.relative');
    const previewContainer = document.querySelector('[class*="BuilderPreview"]');
    
    if (viewport) {
      observer.observe(viewport, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    if (canvasContainer) {
      observer.observe(canvasContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    if (previewContainer) {
      observer.observe(previewContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    // Armazenar o observer para limpeza posterior
    window.canvasResizeObserver = observer;
    
    // Aplicar o fix inicialmente
    fixCanvasWhiteSpace();
  }, [fixCanvasWhiteSpace]);
  
  // Configurar a primeira vez e quando o componente atualizar
  useEffect(() => {
    // Chamar a função para corrigir o espaço em branco no canvas
    fixCanvasWhiteSpace();
    
    // Configurar o observer para mudanças futuras
    setupResizeObserver();
    
    // Adicionar também um listener para evento de resize da janela
    const handleResize = () => {
      fixCanvasWhiteSpace();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Adicionar um listener para mudanças de modo (desktop/mobile)
    const viewModeButtons = document.querySelectorAll('button[class*="rounded-l-none"], button[class*="rounded-r-none"]');
    viewModeButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Dar tempo para a UI atualizar
        setTimeout(fixCanvasWhiteSpace, 100);
      });
    });
    
    // Adicionar um listener para o botão de preview
    const previewButton = document.querySelector('button[class*="gap-1"]');
    if (previewButton) {
      previewButton.addEventListener('click', () => {
        // Dar tempo para a preview aparecer
        setTimeout(fixCanvasWhiteSpace, 200);
      });
    }
    
    // Chamar o fix periodicamente durante 5 segundos para garantir que seja aplicado
    // mesmo após todas as renderizações
    const intervalId = setInterval(fixCanvasWhiteSpace, 500);
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 5000);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.canvasResizeObserver) {
        window.canvasResizeObserver.disconnect();
      }
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      
      viewModeButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
      
      if (previewButton) {
        previewButton.removeEventListener('click', () => {});
      }
    };
  }, [fixCanvasWhiteSpace, setupResizeObserver]);
  
  return {
    fixCanvasWhiteSpace,
  };
};

// Adicionar a definição no Window para o ResizeObserver
declare global {
  interface Window {
    canvasResizeObserver?: MutationObserver;
  }
} 