import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Funnel } from "@/utils/types";
import { funnelService } from "@/services/funnelService";
import { accessService } from "@/services/accessService";
import FunnelPreview from "@/components/FunnelPreview";
import FunnelPasswordProtection from "@/components/FunnelPasswordProtection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, Loader2, Lock } from "lucide-react";

const PublicFunnel = () => {
  const { slug } = useParams<{ slug: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadFunnel = async () => {
      try {
        setLoading(true);
        
        if (!slug) {
          setError("Slug não fornecido");
          setLoading(false);
          return;
        }

        // Buscar o funil pelo slug
        const fetchedFunnel = await funnelService.getFunnelBySlug(slug);
        
        if (!fetchedFunnel) {
          setError("Funil não encontrado");
          setLoading(false);
          return;
        }

        // Verificar se o funil está protegido por senha
        if (fetchedFunnel.password_hash) {
          setRequiresPassword(true);
          setFunnel(fetchedFunnel);
          setLoading(false);
          return;
        }

        // Registrar acesso ao funil
        const newSessionId = await accessService.logAccess(fetchedFunnel.id);
        setSessionId(newSessionId);

        setFunnel(fetchedFunnel);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar funil:", err);
        setError("Não foi possível carregar o funil");
      } finally {
        setLoading(false);
      }
    };

    loadFunnel();
  }, [slug]);

  const handlePasswordVerification = async () => {
    setIsPasswordVerified(true);
  };

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

  // Se o funil estiver protegido por senha e ainda não foi verificada
  if (requiresPassword && !isPasswordVerified) {
    return (
      <FunnelPasswordProtection
        funnel={funnel}
        onPasswordVerified={handlePasswordVerification}
      />
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8" 
         style={{ backgroundColor: funnel.settings?.backgroundColor || '#ffffff' }}>
      <div className="w-full max-w-3xl">
        <FunnelPreview 
          funnel={funnel} 
          isMobile={false} 
          stepIndex={currentStepIndex}
          onNextStep={handleStepChange} 
          key={`public-${funnel.id}-step-${currentStepIndex}`}
        />
      </div>
    </div>
  );
};

export default PublicFunnel; 