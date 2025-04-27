import { useParams, Link } from "react-router-dom";
import { useStore } from "@/utils/store";
import { useEffect, useState } from "react";
import FunnelPreview from "@/components/FunnelPreview";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Monitor, Smartphone } from "lucide-react";
import { Funnel } from "@/utils/types";
import FacebookPixelDebugger from "@/components/pixel/FacebookPixelDebugger";
import { CanvasElement } from "@/types/canvasTypes";

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
        // Criar uma cópia sem modificar a estrutura original
        setLoadedFunnel({...targetFunnel, 
          steps: targetFunnel.steps.map(step => ({
            ...step,
            canvasElements: Array.isArray(step.canvasElements) ? 
              [...step.canvasElements] : []
          }))
        });
      } else {
        console.log("Preview page - Funnel not found with ID:", funnelId);
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
  
  // Determinar se há imagem de fundo para aplicar estilo apropriado
  const hasBackgroundImage = !!loadedFunnel?.settings?.backgroundImage;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-3 px-6 flex items-center justify-between shadow-sm">
        <Link to={`/builder/${funnelId}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Voltar para o construtor
          </Button>
        </Link>
        
        <div className="mx-auto">
          <h1 className="text-lg font-medium">{loadedFunnel.name}</h1>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant={isMobile ? "outline" : "default"} 
            size="sm"
            className="rounded-r-none border-r-0"
            onClick={() => setIsMobile(false)}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button 
            variant={isMobile ? "default" : "outline"} 
            size="sm"
            className="rounded-l-none"
            onClick={() => setIsMobile(true)}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* Replicar exatamente a mesma estrutura do BuilderCanvas sem wrappers adicionais */}
      <main className="flex-1 flex overflow-auto" style={{
        backgroundColor: loadedFunnel.settings?.backgroundColor || '#ffffff',
        backgroundImage: hasBackgroundImage ? `url(${loadedFunnel.settings.backgroundImage})` : 'none',
        backgroundSize: loadedFunnel.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                      loadedFunnel.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: loadedFunnel.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat'
      }}>
        <div className="w-full mx-auto py-8 px-4">
          <FunnelPreview 
            funnel={loadedFunnel} 
            isMobile={isMobile} 
            stepIndex={currentStepIndex}
            onNextStep={handleStepChange} 
            key={`preview-${loadedFunnel.id}`}
            // Desativar centralização para manter a mesma estrutura do builder
            centerContent={false}
          />
        </div>
      </main>
      
      {/* Debugger do Facebook Pixel - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && <FacebookPixelDebugger />}
    </div>
  );
};

export default Preview;
