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
      previewEl.style.margin = '0';
      
      // Aplicar correções de espaçamento no container do FunnelPreview
      const funnelPreviewEl = previewEl.querySelector('[class*="FunnelPreview"]') as HTMLElement;
      if (funnelPreviewEl) {
        funnelPreviewEl.style.padding = '0';
        funnelPreviewEl.style.margin = '0';
        
        // Corrigir espaçamentos internos
        const contentWrappers = funnelPreviewEl.querySelectorAll('[class*="flex"]');
        contentWrappers.forEach(wrapper => {
          const wrapperEl = wrapper as HTMLElement;
          wrapperEl.style.gap = '0';
          wrapperEl.style.marginBottom = '0';
          wrapperEl.style.paddingBottom = '0';
          wrapperEl.style.paddingTop = '0';
        });
      }
      
      // Selecionar o container do canvas preview para ajustes
      const canvasPreviewEl = previewEl.querySelector('[class*="canvas-container"]') as HTMLElement;
      if (canvasPreviewEl) {
        // Reset todos os espaçamentos
        canvasPreviewEl.style.padding = '16px';
        canvasPreviewEl.style.margin = '0';
        canvasPreviewEl.style.gap = '0';
        canvasPreviewEl.style.paddingBottom = '0';
        canvasPreviewEl.style.paddingTop = '0';
      }
      
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
        // Aplicar estilos específicos para cada elemento
        builderElements.forEach((element, index) => {
          if (index < previewElements.length) {
            const builderItem = element as HTMLElement;
            const previewItem = previewElements[index] as HTMLElement;
            
            // Eliminar espaçamentos no preview
            previewItem.style.marginBottom = '0';
            previewItem.style.marginTop = '0';
            previewItem.style.paddingBottom = '0';
            previewItem.style.paddingTop = '0';
            
            // Para o primeiro elemento, ajustar padding superior
            if (index === 0) {
              previewItem.style.paddingTop = '0';
            }
            
            // Sincronizar margens e padding laterais
            previewItem.style.paddingLeft = getComputedStyle(builderItem).paddingLeft;
            previewItem.style.paddingRight = getComputedStyle(builderItem).paddingRight;
            
            // Ajustar altura para coincidir com o builder
            const builderHeight = builderItem.getBoundingClientRect().height;
            // previewItem.style.height = `${builderHeight}px`;
            
            // Corrigir elementos internos
            const previewInnerEls = previewItem.querySelectorAll('*');
            previewInnerEls.forEach(innerEl => {
              const el = innerEl as HTMLElement;
              // Preservar apenas margens laterais e padding necessários para conteúdo
              if (el.style.marginTop || el.style.marginBottom) {
                el.style.marginTop = '0';
                el.style.marginBottom = '0';
              }
              if (el.style.paddingTop || el.style.paddingBottom) {
                el.style.paddingTop = '0';
                el.style.paddingBottom = '0';
              }
            });
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
    
    // Adicionar um listener específico para o botão de visualização
    const previewButton = document.querySelector('button[class*="gap-1"]');
    if (previewButton) {
      previewButton.addEventListener('click', () => {
        // Função específica para corrigir espaçamentos na visualização
        const fixPreviewSpacing = () => {
          // Selecionar todos os elementos da visualização
          const previewContainer = document.querySelector('[class*="BuilderPreview"]');
          if (!previewContainer) return;
          
          // Aplicar correções agressivas em todos os elementos
          const allElements = previewContainer.querySelectorAll('*');
          allElements.forEach(el => {
            const element = el as HTMLElement;
            
            // Remover margens e paddings verticais
            element.style.marginTop = '0';
            element.style.marginBottom = '0';
            element.style.paddingTop = '0';
            element.style.paddingBottom = '0';
            
            // Manter apenas espaçamentos laterais
            const computedStyle = window.getComputedStyle(element);
            element.style.paddingLeft = computedStyle.paddingLeft;
            element.style.paddingRight = computedStyle.paddingRight;
            
            // Tratar casos específicos
            if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3' || element.tagName === 'P') {
              element.style.marginBottom = '4px'; // Pequeno espaçamento para legibilidade
            }
            
            // Tratar espaçamento vertical entre os elementos
            if (element.classList.contains('canvas-element') || element.classList.contains('canvas-element-mobile')) {
              element.style.marginBottom = '0';
            }
          });
          
          // Focar também nos containers principais
          const mainContainers = previewContainer.querySelectorAll('[class*="canvas-container"], [class*="FunnelPreview"]');
          mainContainers.forEach(container => {
            const el = container as HTMLElement;
            el.style.gap = '0';
            el.style.marginBottom = '0';
            el.style.paddingBottom = '0';
            el.style.marginTop = '0';
            el.style.paddingTop = '0';
          });
        };
        
        // Executar as correções várias vezes para garantir que sejam aplicadas
        setTimeout(fixPreviewSpacing, 100);
        setTimeout(fixPreviewSpacing, 300);
        setTimeout(fixPreviewSpacing, 500);
        setTimeout(fixPreviewSpacing, 1000);
        
        // Também aplicar correções normais
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