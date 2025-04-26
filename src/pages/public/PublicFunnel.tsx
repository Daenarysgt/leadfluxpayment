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
import { supabase } from "@/lib/supabase";

const PublicFunnel = () => {
  const { slug } = useParams<{ slug: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Detectar se é dispositivo móvel
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Verificar no carregamento
    checkMobile();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

        console.log("Funil carregado, registrando acesso:", fetchedFunnel.id);
        
        try {
          // Registrar acesso ao funil
          const newSessionId = await accessService.logAccess(fetchedFunnel.id);
          setSessionId(newSessionId);
          console.log("Acesso registrado com ID de sessão:", newSessionId);
          
          // Armazenar sessionId no storage do navegador para maior persistência
          window.sessionStorage.setItem('funnel_session_id', newSessionId);

          // E também no localStorage para retorno do visitante
          try {
            window.localStorage.setItem('funnel_session_id', newSessionId);
          } catch (storageError) {
            console.warn('Não foi possível salvar sessão no localStorage:', storageError);
          }
          
          // Registrar também no registro diário (para estatísticas adicionais)
          try {
            await supabase.rpc('register_daily_access', {
              p_funnel_id: fetchedFunnel.id,
              p_session_id: newSessionId
            });
          } catch (dailyError) {
            console.error("Erro ao registrar acesso diário:", dailyError);
          }
        } catch (accessError) {
          console.error("Erro ao registrar acesso:", accessError);
          // Continuar mesmo se houver erro no registro de acesso
        }

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
    if (!funnel) return;
    
    try {
      // Registrar acesso depois que a senha for verificada
      const newSessionId = await accessService.logAccess(funnel.id);
      setSessionId(newSessionId);
      console.log("Acesso registrado após verificação de senha:", newSessionId);

      // Armazenar sessionId no storage do navegador após verificação de senha
      window.sessionStorage.setItem('funnel_session_id', newSessionId);
      try {
        window.localStorage.setItem('funnel_session_id', newSessionId);
      } catch (storageError) {
        console.warn('Não foi possível salvar sessão no localStorage:', storageError);
      }
    } catch (error) {
      console.error("Erro ao registrar acesso após senha:", error);
    }
    
    setIsPasswordVerified(true);
  };

  const handleStepChange = async (index: number) => {
    if (!funnel) return;
    
    console.log(`Mudando para o passo ${index+1} de ${funnel.steps.length}`);
    
    try {
      // Registrar o progresso
      await accessService.updateProgress(funnel.id, index + 1, sessionId);
      console.log(`Progresso atualizado para passo ${index+1}`);
      
      // Se chegou na última etapa, registrar como conversão
      if (index === funnel.steps.length - 1) {
        console.log("Última etapa alcançada, registrando conversão");
        
        try {
          await accessService.updateProgress(funnel.id, index + 1, sessionId, true);
          console.log("Conversão registrada com sucesso");
          
          // Tente também registrar um evento de fluxo completo diretamente
          // para ter redundância no registro da conversão
          try {
            const { error } = await supabase.rpc('register_flow_complete', {
              p_funnel_id: funnel.id,
              p_session_id: sessionId
            });
            
            if (error) {
              console.error("Erro ao registrar fluxo completo:", error);
            }
          } catch (flowError) {
            console.error("Exceção ao registrar fluxo completo:", flowError);
          }
        } catch (convError) {
          console.error("Erro ao registrar conversão:", convError);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      // Continuar a navegação mesmo se houver erro no registro
    }
    
    setCurrentStepIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          {/* Spinner com gradiente personalizado */}
          <div className="relative h-16 w-16">
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
            <div className="absolute top-1 left-1 right-1 bottom-1 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-transparent border-t-blue-300 border-r-purple-300 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          </div>
        </div>
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

  // Classes condicionais baseadas no tipo de dispositivo
  const containerClass = isMobile 
    ? "h-[100dvh] flex flex-col items-center justify-start p-0 m-0 mobile-full-width pt-1" 
    : "h-[100dvh] flex flex-col items-center justify-start p-4 md:p-8 pt-2";
  
  const innerClass = isMobile 
    ? "w-full mobile-full-width flex flex-col h-full" 
    : "w-full max-w-2xl mx-auto flex flex-col h-full";
    
  // Estilos específicos para mobile
  const containerStyle = isMobile ? {
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
  } : {
    backgroundColor: funnel.settings?.backgroundColor || '#ffffff',
    backgroundImage: funnel.settings?.backgroundImage ? `url(${funnel.settings.backgroundImage})` : 'none',
    backgroundSize: funnel.settings?.backgroundImageStyle === 'contain' ? 'contain' : 
                    funnel.settings?.backgroundImageStyle === 'repeat' ? 'auto' : 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: funnel.settings?.backgroundImageStyle === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundAttachment: funnel.settings?.backgroundImageStyle === 'fixed' ? 'fixed' : 'scroll'
  };

  return (
    <div className={containerClass} style={containerStyle}>
      <div className={innerClass} style={isMobile ? {overflowY: 'auto', maxHeight: 'none'} : {}}>
        <FunnelPreview 
          funnel={funnel} 
          isMobile={isMobile} 
          stepIndex={currentStepIndex}
          onNextStep={handleStepChange} 
          key={`public-${funnel.id}-step-${currentStepIndex}`}
          centerContent={true}
        />
      </div>
    </div>
  );
};

export default PublicFunnel; 