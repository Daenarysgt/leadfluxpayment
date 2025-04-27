import React from 'react';
import { useStore } from "@/utils/store";
import CanvasPreview from "@/components/funnel-preview/CanvasPreview";

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

  // Obter os elementos do canvas da etapa atual
  const stepData = currentFunnel.steps[currentStep];
  const canvasElements = stepData?.canvasElements || [];
  
  // Importante: Definimos apenas as propriedades essenciais de background aqui,
  // e todo o resto da estrutura, alinhamento, etc é igual ao builder
  return (
    <div className="builder-canvas-container" 
      style={{ 
        backgroundColor: currentFunnel.settings?.backgroundColor || '#ffffff',
        backgroundImage: currentFunnel.settings?.backgroundImage ? 
          `url(${currentFunnel.settings.backgroundImage})` : 'none',
        backgroundSize: currentFunnel.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                       currentFunnel.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: currentFunnel.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat',
      }}>
      <CanvasPreview
        canvasElements={canvasElements}
        activeStep={currentStep}
        onStepChange={() => {}}
        funnel={currentFunnel}
        isMobile={isMobile}
        builderMode={true}
      />
    </div>
  );
});

BuilderPreview.displayName = "BuilderPreview";

export default BuilderPreview;
