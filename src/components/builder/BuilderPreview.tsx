import React, { useEffect, useRef } from 'react';
import FunnelPreview from "@/components/FunnelPreview"; // Importação direta do componente principal
import { useStore } from "@/utils/store";

const BuilderPreview = React.memo(({ isMobile }: { isMobile: boolean }) => {
  const { currentFunnel, currentStep } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Função para aplicar correções específicas após renderização
  useEffect(() => {
    if (containerRef.current) {
      // Aplicar correções diretas no DOM para remover espaçamentos indesejados
      const removeExcessiveSpacing = () => {
        const container = containerRef.current;
        if (!container) return;
        
        // Remover espaçamentos do container principal
        container.style.margin = '0';
        container.style.padding = '0';
        
        // Encontrar elementos com espaçamento vertical e corrigir
        const allElements = container.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          const computedStyle = window.getComputedStyle(element);
          
          // Identificar elementos com margens ou paddings verticais excessivos
          const marginTop = parseFloat(computedStyle.marginTop);
          const marginBottom = parseFloat(computedStyle.marginBottom);
          const paddingTop = parseFloat(computedStyle.paddingTop);
          const paddingBottom = parseFloat(computedStyle.paddingBottom);
          
          // Corrigir apenas espaçamentos excessivos (mais de 8px)
          if (marginTop > 8) element.style.marginTop = '0';
          if (marginBottom > 8) element.style.marginBottom = '0';
          if (paddingTop > 8) element.style.paddingTop = '0';
          if (paddingBottom > 8) element.style.paddingBottom = '0';
        });
        
        // Corrigir barra de progresso (um comum causador de espaçamento)
        const progressBar = container.querySelector('[class*="rounded-full"]');
        if (progressBar) {
          const progressContainer = progressBar.parentElement;
          if (progressContainer) {
            (progressContainer as HTMLElement).style.marginBottom = '0';
          }
        }
      };
      
      // Executar correções após um curto delay para garantir que o DOM esteja atualizado
      setTimeout(removeExcessiveSpacing, 50);
      // Executar novamente depois de um tempo maior para garantir que todos os elementos estejam renderizados
      setTimeout(removeExcessiveSpacing, 300);
    }
  }, [currentFunnel, currentStep, isMobile]);
  
  if (!currentFunnel) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="font-medium text-lg mb-2">No Funnel Selected</h3>
          <p className="text-muted-foreground text-sm">Select or create a funnel to see the preview.</p>
        </div>
      </div>
    );
  }

  // Using a unique key with both funnel ID, step index, and timestamp ensures a full re-render when switching steps
  // Determinar se há uma imagem de fundo para aplicar estilo apropriado
  const hasBackgroundImage = !!currentFunnel.settings?.backgroundImage;
  
  // Criando um wrapper de estilo para garantir consistência com o BuilderCanvas
  const containerStyle = {
    width: isMobile ? '100%' : 'auto',
    maxWidth: isMobile ? '375px' : '600px', // Mesmo valor usado no BuilderCanvas
    margin: '0 auto',
    padding: '0',
    minHeight: '300px',
    borderRadius: isMobile ? '0' : '0.5rem',
    overflow: 'hidden', // Evitar qualquer overflow indesejado
    backgroundColor: currentFunnel.settings?.backgroundColor || '#ffffff'
  };

  return (
    <div className="w-full" style={containerStyle} ref={containerRef}>
      <FunnelPreview 
        funnel={currentFunnel} 
        isMobile={isMobile} 
        stepIndex={currentStep} 
        centerContent={false}
        key={`preview-${currentFunnel.id}-${currentStep}-${Date.now()}`}
      />
    </div>
  );
});

BuilderPreview.displayName = "BuilderPreview";

export default BuilderPreview;
