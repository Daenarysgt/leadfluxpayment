import { useEffect, useState } from "react";
import { Funnel } from "@/utils/types";
import { funnelService } from "@/services/funnelService";
import { domainsService } from "@/services/domains";
import { accessService } from "@/services/accessService";
import FunnelPreview from "@/components/FunnelPreview";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";

// Detectar mobile no carregamento do componente sem esperar useEffect
// Isso garante que a primeira renderização já saiba se é mobile
const detectMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768;
  }
  return false; // Padrão para SSR
};

// Componente para renderizar a tela de carregamento
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <div className="flex flex-col items-center">
      <div className="relative h-16 w-16">
        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
        <div className="absolute top-1 left-1 right-1 bottom-1 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-transparent border-t-blue-300 border-r-purple-300 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
      </div>
    </div>
  </div>
);

// Componente para renderizar a tela de erro
const ErrorScreen = ({ message }: { message: string }) => (
  <div className="h-screen flex flex-col items-center justify-center bg-white">
    <div className="text-center p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Funil não encontrado</h1>
      <p className="text-muted-foreground mb-6">
        {message || "O funil que você está tentando acessar não existe ou foi desativado."}
      </p>
      <Link to="/">
        <Button>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para a página inicial
        </Button>
      </Link>
    </div>
  </div>
);

// Componente para renderizar o conteúdo do funil
const FunnelContent = ({ 
  funnel, 
  isMobile, 
  currentStepIndex, 
  onStepChange 
}: { 
  funnel: Funnel, 
  isMobile: boolean, 
  currentStepIndex: number,
  onStepChange: (index: number) => void 
}) => {
  // Classes condicionais baseadas no tipo de dispositivo
  const containerClass = isMobile 
    ? "h-[100dvh] flex flex-col items-center justify-start p-0 m-0 mobile-full-width pt-1" 
    : "min-h-[100dvh] flex flex-col items-center justify-start p-4 md:p-8 pt-2";
  
  const innerClass = isMobile 
    ? "w-full mobile-full-width flex flex-col h-full" 
    : "w-full max-w-2xl mx-auto flex flex-col h-full relative z-10";
    
  // Força renderização em um contêiner controlado para desktop,
  // independentemente do estado de autenticação do usuário
  const shouldUseContainerStyle = !isMobile;
    
  // Estilos específicos para desktop e mobile
  const containerStyle = shouldUseContainerStyle
    ? {
        // Estilo para desktop dentro de um contêiner controlado
        backgroundColor: funnel.settings?.backgroundColor || '#ffffff',
        backgroundImage: funnel.settings?.backgroundImage ? `url(${funnel.settings.backgroundImage})` : 'none',
        backgroundSize: funnel.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                      funnel.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: funnel.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat',
        backgroundAttachment: funnel.settings?.backgroundImageStyle === 'fixed' ? 'fixed' : 'scroll',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }
    : {
        // Em mobile, estilo padrão
    width: '100%',
    maxWidth: '100%',
    padding: '0',
    margin: '0',
    overflow: 'auto',
    backgroundColor: funnel.settings?.backgroundColor || '#ffffff',
    backgroundImage: funnel.settings?.backgroundImage ? `url(${funnel.settings.backgroundImage})` : 'none',
    backgroundSize: funnel.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                    funnel.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: funnel.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundAttachment: funnel.settings?.backgroundImageStyle === 'fixed' ? 'fixed' : 'scroll'
  };
  
  // Aplicar estilo de página completa para desktop quando o funil é carregado
  useEffect(() => {
    if (!isMobile) {
      // Aplicar o fundo à página inteira em vez de apenas ao contêiner
      document.body.style.backgroundColor = funnel.settings?.backgroundColor || '#ffffff';
      document.body.style.backgroundImage = funnel.settings?.backgroundImage 
        ? `url(${funnel.settings.backgroundImage})` 
        : 'none';
      document.body.style.backgroundSize = funnel.settings?.backgroundImageStyle === 'contain' 
        ? 'contain' 
        : funnel.settings?.backgroundImageStyle === 'repeat' 
          ? 'auto' 
          : 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = funnel.settings?.backgroundImageStyle === 'repeat' 
        ? 'repeat' 
        : 'no-repeat';
      document.body.style.backgroundAttachment = funnel.settings?.backgroundImageStyle === 'fixed' 
        ? 'fixed' 
        : 'scroll';
      document.body.style.minHeight = '100vh';
      document.body.style.margin = '0';
    }
  }, [funnel, isMobile]);

  // Verificar se o step atual existe e tem elementos
  const safeCurrentStepIndex = Math.min(currentStepIndex, funnel.steps.length - 1);
  const currentStep = funnel.steps[safeCurrentStepIndex];
  
  // Se a etapa atual não tiver elementos do canvas, mostrar um erro
  if (!currentStep || !Array.isArray(currentStep.canvasElements)) {
    return <ErrorScreen message="Etapa do funil incompleta" />;
  }

  return (
    <div className={containerClass} style={containerStyle}>
      <div className={innerClass} style={isMobile ? {overflowY: 'auto', maxHeight: 'none'} : {}}>
        <FunnelPreview 
          funnel={funnel} 
          isMobile={isMobile} 
          stepIndex={safeCurrentStepIndex}
          onNextStep={onStepChange} 
          key={`domain-${funnel.id}-step-${safeCurrentStepIndex}`}
          centerContent={true}
        />
      </div>
    </div>
  );
};

// Componente principal DomainFunnel
const DomainFunnel = () => {
  const [funnelData, setFunnelData] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(detectMobile());
  
  // Scroll para o topo quando a página carrega
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Scroll para o topo quando muda de step
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStepIndex]);
  
  // Detectar mudanças de tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Limpar estilos do body quando o componente for desmontado
  useEffect(() => {
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.minHeight = '';
      document.body.style.margin = '';
    };
  }, []);
  
  // Carregar os dados do funil
  useEffect(() => {
    const loadFunnel = async () => {
      try {
        setLoading(true);
        
        // 1. Buscar o domínio atual
        const currentDomain = window.location.hostname;
        console.log("DomainFunnel - Domínio atual:", currentDomain);
        
        // 2. Buscar o domínio no banco de dados
        console.log("DomainFunnel - Buscando configuração do domínio...");
        const domainConfig = await domainsService.getDomainByName(currentDomain);
        
        if (!domainConfig) {
          console.error("DomainFunnel - Domínio não encontrado no banco de dados");
          setError("Domínio não encontrado");
          setLoading(false);
          return;
        }

        console.log("DomainFunnel - Configuração do domínio encontrada:", {
          id: domainConfig.id,
          domain: domainConfig.domain,
          funnel_id: domainConfig.funnel_id,
          status: domainConfig.status
        });

        if (!domainConfig.funnel_id) {
          console.error("DomainFunnel - Domínio não tem funil associado");
          setError("Configuração incompleta do domínio");
          setLoading(false);
          return;
        }

        // 3. Buscar o funil pelo ID
        console.log("DomainFunnel - Buscando funil com ID:", domainConfig.funnel_id);
        const fetchedFunnel = await funnelService.getFunnelById(domainConfig.funnel_id);
        
        if (!fetchedFunnel) {
          console.error("DomainFunnel - Funil não encontrado com o ID:", domainConfig.funnel_id);
          setError("Funil não encontrado");
          setLoading(false);
          return;
        }

        // 4. Verificar se o funil tem steps
        if (!fetchedFunnel.steps || fetchedFunnel.steps.length === 0) {
          console.error("DomainFunnel - Funil não tem steps:", fetchedFunnel.id);
          setError("Funil em construção");
          setLoading(false);
          return;
        }

        // 5. Verificar se cada step tem canvasElements definido como array
        const hasValidSteps = fetchedFunnel.steps.every(step => 
          step && 
          Array.isArray(step.canvasElements)
        );

        if (!hasValidSteps) {
          console.error("DomainFunnel - Alguns steps não têm canvasElements válidos");
          
          // Normalizar os steps, garantindo que todos tenham canvasElements como array
          fetchedFunnel.steps = fetchedFunnel.steps.map(step => ({
            ...step,
            canvasElements: Array.isArray(step.canvasElements) ? step.canvasElements : []
          }));
        }

        console.log("DomainFunnel - Funil carregado com sucesso:", {
          id: fetchedFunnel.id,
          name: fetchedFunnel.name,
          stepsCount: fetchedFunnel.steps.length,
          steps: fetchedFunnel.steps.map(s => ({
            id: s.id,
            title: s.title,
            hasCanvasElements: Array.isArray(s.canvasElements) && s.canvasElements.length > 0
          }))
        });

        // Registrar acesso ao funil
        const newSessionId = await accessService.logAccess(fetchedFunnel.id);
        setSessionId(newSessionId);

        // Só atualizar o estado depois de todas as verificações
        setFunnelData(fetchedFunnel);
        setError(null);
      } catch (err) {
        console.error("DomainFunnel - Erro detalhado ao carregar funil:", err);
        setError("Não foi possível carregar o funil");
      } finally {
        setLoading(false);
      }
    };
    
    loadFunnel();
  }, []);
  
  // Handler para mudança de etapa
  const handleStepChange = async (index: number) => {
    if (!funnelData) return;
    
    // Scroll para o topo ao mudar de etapa
    window.scrollTo(0, 0);
    
    // Registrar interação do usuário com o funil
    await accessService.updateProgress(funnelData.id, index + 1, sessionId);
    
    // Se chegou na última etapa, registrar como conversão
    if (index === funnelData.steps.length - 1) {
      await accessService.updateProgress(funnelData.id, index + 1, sessionId, true);
    }
    
    setCurrentStepIndex(index);
  };

  // Renderização condicional baseada no estado
  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !funnelData) {
    return <ErrorScreen message={error || "O funil não pôde ser carregado"} />;
  }

  // Verificação de steps aqui impede a renderização se não houver steps
  if (!funnelData.steps || funnelData.steps.length === 0) {
    return <ErrorScreen message="Funil em construção" />;
  }

  // Renderizar o conteúdo do funil apenas quando todos os dados estiverem disponíveis
  return (
    <FunnelContent 
      funnel={funnelData} 
          isMobile={isMobile} 
      currentStepIndex={currentStepIndex} 
      onStepChange={handleStepChange} 
    />
  );
};

export default DomainFunnel; 