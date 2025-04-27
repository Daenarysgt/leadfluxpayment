import { useEffect, useCallback } from 'react';

// Este hook gerencia o recálculo de altura do canvas para evitar a borda branca
export const useCanvasResize = () => {
  // Função para detectar e corrigir o problema da borda branca
  const fixCanvasWhiteSpace = useCallback(() => {
    // Selecionar os elementos principais relacionados ao canvas
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    const canvasContainer = document.querySelector('.ScrollAreaViewport > div');
    
    if (viewport && canvasContainer) {
      // Garantir tamanho e estrutura sem alterar as propriedades originais
      const viewportEl = viewport as HTMLElement;
      viewportEl.style.height = 'auto';
      viewportEl.style.minHeight = '100%';
      
      // Garantir que o container do canvas mantenha sua estrutura original
      const containerEl = canvasContainer as HTMLElement;
      containerEl.style.flexGrow = '1';
      
      // Não devemos alterar padding-bottom ou outras propriedades que afetam o layout
      // Apenas garantir que a área de arrastar esteja visível
      const dropArea = document.querySelector('[class*="canvas"] > div:last-child');
      if (dropArea) {
        const dropAreaEl = dropArea as HTMLElement;
        dropAreaEl.style.visibility = 'visible';
        dropAreaEl.style.opacity = '1';
        dropAreaEl.style.pointerEvents = 'auto';
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
    
    // Chamar o fix apenas uma vez após 500ms
    const timeoutId = setTimeout(fixCanvasWhiteSpace, 500);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.canvasResizeObserver) {
        window.canvasResizeObserver.disconnect();
      }
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