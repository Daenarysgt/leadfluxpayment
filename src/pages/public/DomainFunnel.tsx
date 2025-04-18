import { useEffect, useState } from "react";
import { Funnel } from "@/utils/types";
import { funnelService } from "@/services/funnelService";
import { domainsService } from "@/services/domains";
import { accessService } from "@/services/accessService";
import FunnelPreview from "@/components/FunnelPreview";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";

const DomainFunnel = () => {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
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

        setFunnel(fetchedFunnel);
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
  
  const handleStepChange = async (index: number) => {
    if (!funnel) return;
    
    // Registrar interação do usuário com o funil
    await accessService.updateProgress(funnel.id, index + 1, sessionId);
    
    // Se chegou na última etapa, registrar como conversão
    if (index === funnel.steps.length - 1) {
      await accessService.updateProgress(funnel.id, index + 1, sessionId, true);
    }
    
    setCurrentStepIndex(index);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Carregando funil...</p>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Funil não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            {error || "O funil que você está tentando acessar não existe ou foi desativado."}
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
  }

  // Se não houver steps, exibir mensagem de erro
  if (!funnel.steps || funnel.steps.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Funil em construção</h1>
          <p className="text-muted-foreground mb-6">
            Este funil ainda não possui conteúdo disponível.
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
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-0 sm:p-2">
      <div className="w-full">
        <FunnelPreview 
          funnel={funnel} 
          isMobile={true} 
          stepIndex={currentStepIndex}
          onNextStep={handleStepChange} 
          key={`domain-${funnel.id}-step-${currentStepIndex}`}
        />
      </div>
    </div>
  );
};

export default DomainFunnel; 