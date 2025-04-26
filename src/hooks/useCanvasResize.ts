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
      viewportEl.style.overflow = 'hidden'; // Garantir que não haja overflow
      
      // Garantir que o container do canvas tenha altura automática
      const containerEl = canvasContainer as HTMLElement;
      containerEl.style.flexGrow = '1';
      containerEl.style.display = 'flex';
      containerEl.style.flexDirection = 'column';
      containerEl.style.overflow = 'hidden'; // Garantir que não haja overflow
      
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
        
        // Certificar que não haja margens entre elementos que causam os espaços brancos
        el.style.marginTop = '0';
        el.style.marginBottom = '0';
        el.style.overflow = 'hidden'; // Impedir overflow
        
        // Garantir que o background seja aplicado corretamente
        const bgColor = getComputedStyle(el.parentElement as HTMLElement).backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          el.style.backgroundColor = bgColor;
        } else {
          el.style.backgroundColor = '#ffffff'; // Fallback para branco
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
      
      // Corrigir problemas específicos do mobile com elementos inset visíveis
      const mobileCanvasParents = document.querySelectorAll('.max-w-\\[375px\\]');
      mobileCanvasParents.forEach((element) => {
        const el = element as HTMLElement;
        el.style.overflow = 'hidden';
        el.style.backgroundColor = getComputedStyle(el).backgroundColor;
      });
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