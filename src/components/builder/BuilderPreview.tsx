import React from 'react';
import FunnelPreview from "@/components/FunnelPreview"; // Importação direta do componente principal
import { useStore } from "@/utils/store";

const BuilderPreview = React.memo(({ isMobile }: { isMobile: boolean }) => {
  const { currentFunnel, currentStep } = useStore();
  
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
    <div className="w-full" style={containerStyle}>
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
