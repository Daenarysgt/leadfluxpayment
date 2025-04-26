import { useParams } from "react-router-dom";
import { useStore } from "@/utils/store";
import { useEffect, useState } from "react";
import FunnelPreview from "@/components/FunnelPreview";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Funnel } from "@/utils/types";
import FacebookPixelDebugger from "@/components/pixel/FacebookPixelDebugger";

// Detectar mobile no carregamento inicial
const detectMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768;
  }
  return false; // Padrão para SSR
};

const Preview = () => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const { funnels } = useStore();
  const [isMobile, setIsMobile] = useState(detectMobile());
  const [loadedFunnel, setLoadedFunnel] = useState<Funnel | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Adicionar listener para redimensionamento
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    if (funnelId) {
      console.log("Preview page - Looking for funnel with ID:", funnelId);
      const targetFunnel = funnels.find(f => f.id === funnelId);
      
      if (targetFunnel) {
        console.log("Preview page - Found funnel:", targetFunnel.name);
        // Create a deep clone to avoid any reference issues
        setLoadedFunnel(JSON.parse(JSON.stringify(targetFunnel)));
      } else {
        console.log("Preview page - Funnel not found with ID:", funnelId);
        console.log("Available funnels:", funnels.map(f => ({ id: f.id, name: f.name })));
      }
    }
  }, [funnelId, funnels]);
  
  if (!loadedFunnel) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Funil não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O funil que você está tentando visualizar não existe ou foi excluído.
          </p>
          <Link to="/builder">
            <Button>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar para o construtor
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleStepChange = (index: number) => {
    console.log(`Preview - Changing step to ${index}`);
    setCurrentStepIndex(index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b py-3 px-6 flex items-center">
        <Link to="/builder">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Voltar para o construtor
          </Button>
        </Link>
        
        <div className="mx-auto">
          <h1 className="text-lg font-medium">{loadedFunnel.name} - Visualização</h1>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant={isMobile ? "outline" : "default"} 
            size="sm"
            onClick={() => setIsMobile(false)}
          >
            Desktop
          </Button>
          <Button 
            variant={isMobile ? "default" : "outline"} 
            size="sm"
            onClick={() => setIsMobile(true)}
          >
            Mobile
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className={`${isMobile ? 'max-w-sm' : 'w-full max-w-2xl'}`}>
          <FunnelPreview 
            funnel={loadedFunnel} 
            isMobile={isMobile} 
            stepIndex={currentStepIndex}
            onNextStep={handleStepChange} 
            key={`preview-${loadedFunnel.id}`}
          />
        </div>
      </main>
      
      {/* Debugger do Facebook Pixel - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && <FacebookPixelDebugger />}
    </div>
  );
};

export default Preview;
