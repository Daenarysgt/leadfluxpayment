import React from 'react';
import FunnelPreview from "@/components/funnel-preview/FunnelPreview"; // Import from correct path
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

  // Determinar se há uma imagem de fundo para aplicar estilo apropriado
  const hasBackgroundImage = !!currentFunnel.settings?.backgroundImage;
  
  return (
    <div className="w-full flex items-center justify-center" 
         style={{ 
           backgroundColor: currentFunnel.settings?.backgroundColor || '#ffffff',
           backgroundImage: hasBackgroundImage ? `url(${currentFunnel.settings.backgroundImage})` : 'none',
           backgroundSize: currentFunnel.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                           currentFunnel.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: currentFunnel.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat',
           backgroundAttachment: currentFunnel.settings?.backgroundImageStyle === 'fixed' ? 'fixed' : 'scroll',
           minHeight: '100%',
           paddingBottom: '3rem'
         }}>
      <div className={`${isMobile ? 'max-w-sm' : 'w-full'} py-6`}>
        <FunnelPreview 
          funnel={JSON.parse(JSON.stringify(currentFunnel))} 
          isMobile={isMobile} 
          stepIndex={currentStep}
          key={`preview-${currentFunnel.id}-step-${currentStep}`} 
        />
      </div>
    </div>
  );
});

BuilderPreview.displayName = "BuilderPreview";

export default BuilderPreview;
