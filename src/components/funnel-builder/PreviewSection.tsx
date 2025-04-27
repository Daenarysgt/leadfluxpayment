import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import FunnelPreview from "@/components/funnel-preview/FunnelPreview";
import { useStore } from "@/utils/store";
import { useState, useEffect } from "react";

// Detectar mobile no carregamento inicial
const detectMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768;
  }
  return false;
};

const PreviewSection = () => {
  const { currentFunnel, currentStep, setCurrentStep } = useStore();
  const [isMobile, setIsMobile] = useState(detectMobile());
  
  // Adicionar listener para redimensionamento
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug: verificar se o logo existe no funnel
  console.log("PreviewSection - Logo existe no funnel:", !!currentFunnel?.settings?.logo);

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  return (
    <div className="bg-gray-100 rounded-lg flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h3 className="font-medium">Preview</h3>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" /> Preview Settings
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto">
          <FunnelPreview 
            funnel={currentFunnel}
            stepIndex={currentStep}
            onNextStep={handleStepChange}
            key={`preview-${currentFunnel?.id}`}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;
