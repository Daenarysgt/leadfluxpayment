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
  return (
    <div className="h-full overflow-auto flex items-center justify-center">
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
