import { useParams, Link } from "react-router-dom";
import { useStore } from "@/utils/store";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Monitor, Smartphone } from "lucide-react";
import { Funnel } from "@/utils/types";
import FacebookPixelDebugger from "@/components/pixel/FacebookPixelDebugger";
import CanvasPreview from "@/components/funnel-preview/CanvasPreview";
import ProgressBar from "@/components/funnel-preview/ProgressBar";

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
  const contentContainerRef = useRef<HTMLDivElement>(null);
  
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

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  // Obter os canvasElements do step atual
  const currentStep = loadedFunnel.steps[currentStepIndex];
  const canvasElements = currentStep && Array.isArray(currentStep.canvasElements) 
    ? currentStep.canvasElements 
    : [];
    
  // Obter configurações de estilo
  const { primaryColor, logo } = loadedFunnel.settings || {};

  return (
    <div className="flex flex-col h-screen">
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
      
      {/* Container principal com fundo e configurações de background */}
      <div 
        ref={contentContainerRef}
        className="flex-1 flex flex-col overflow-auto" 
        style={{
          backgroundColor: loadedFunnel.settings?.backgroundColor || '#ffffff',
          backgroundImage: loadedFunnel.settings?.backgroundImage ? `url(${loadedFunnel.settings.backgroundImage})` : 'none',
          backgroundSize: loadedFunnel.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                        loadedFunnel.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: loadedFunnel.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat'
        }}
      >
        {/* Header normal com logo e barra de progresso (apenas mobile) */}
        {isMobile && (
          <div className="w-full bg-white shadow-sm">
            <div className="px-4">
              {/* Logo */}
              {logo && typeof logo === 'string' && logo.startsWith('data:image/') && (
                <div className="w-full flex justify-center py-2">
                  <img 
                    src={logo} 
                    alt="Logo" 
                    className="max-h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Progress Bar com margens laterais */}
              {loadedFunnel.settings?.showProgressBar && (
                <div className="pb-2">
                  <ProgressBar 
                    currentStep={currentStepIndex} 
                    totalSteps={loadedFunnel.steps.length} 
                    primaryColor={primaryColor}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Conteúdo principal centralizado */}
        <div className="flex-1 flex justify-center">
          {/* Contêiner para garantir largura máxima em desktop e responsividade em mobile */}
          <div className={`w-full ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
            <CanvasPreview
              canvasElements={canvasElements}
              activeStep={currentStepIndex}
              onStepChange={handleStepChange}
              funnel={loadedFunnel}
              isMobile={isMobile}
              isPreviewPage={true}
            />
          </div>
        </div>
      </div>
      
      {/* Debugger do Facebook Pixel - apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && <FacebookPixelDebugger />}
    </div>
  );
};

export default Preview;
