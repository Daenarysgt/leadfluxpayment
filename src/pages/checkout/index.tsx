import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/Spinner';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '../../lib/supabase';

interface LocationState {
  planId: string;
  interval: 'month' | 'year';
}

interface StoredPlanInfo {
  planId: string;
  interval: 'month' | 'year';
  timestamp: number;
  planName?: string;
}

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutInitiated, setCheckoutInitiated] = useState(false);
  const [authRetries, setAuthRetries] = useState(0);
  
  // Extrair parâmetros da URL
  const searchParams = new URLSearchParams(location.search);
  const planId = searchParams.get('plan_id');
  const interval = searchParams.get('interval') as 'month' | 'year';
  const planName = searchParams.get('plan_name');
  const timestamp = searchParams.get('timestamp');
  const redirectCount = searchParams.get('redir_count') ? parseInt(searchParams.get('redir_count') || '0', 10) : 0;
  const newRedirectCount = redirectCount + 1;

  // Effect para verificar se o usuário está autenticado e fazer o redirecionamento caso não esteja
  useEffect(() => {
    if (!user && !authLoading && authRetries < 3) {
      console.log('👤 Usuário não autenticado, redirecionando para login...', { redirectCount, newRedirectCount });
      
      // Se já redirecionou muitas vezes, apresentar um erro
      if (redirectCount >= 3) {
        console.error('🔄 Ciclo de redirecionamento detectado no checkout!');
        setError('Detectamos um problema de autenticação. Por favor, faça login manualmente e tente novamente.');
        setLoading(false);
        return;
      }
      
      // Criar parâmetros para redirecionamento, preservando informações importantes
      const params = new URLSearchParams();
      params.set('redirect_after', 'checkout');
      
      // Usar os parâmetros de URL que foram extraídos no nível do componente
      if (planId) {
        params.set('plan_id', planId);
      }
      
      if (interval) {
        params.set('interval', interval);
      }
      
      if (planName) {
        params.set('plan_name', planName);
      }
      
      // Adicionar parâmetros para diagnóstico
      params.set('timestamp', timestamp || Date.now().toString());
      params.set('redir_count', newRedirectCount.toString());
      
      // Redirecionar para página de login com os parâmetros
      navigate(`/auth/login?${params.toString()}`, { replace: true });
      return;
    }

    // Se estamos ainda carregando ou se já iniciamos o checkout, não fazer nada
    if (authLoading) {
      console.log('⏳ Aguardando carregamento de autenticação...');
      return;
    }
    
    const initCheckout = async () => {
      // Se já iniciou o checkout, não faça novamente
      if (checkoutInitiated) return;
      
      // Verificar diretamente com o Supabase para ter certeza do estado de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log para depuração - Verificação completa do estado
      console.log('📌 Estado do componente de checkout:', {
        user: user?.id || session?.user?.id,
        authState: !!user,
        sessionState: !!session,
        locationState: location.state,
        urlParams: {
          planId: planId,
          interval: interval,
          planName: planName,
          timestamp: timestamp
        },
        hasLocalStorage: !!localStorage.getItem('selectedPlanInfo'),
        hasSessionStorage: !!sessionStorage.getItem('selectedPlanInfo_backup')
      });
      
      // Tenta obter o plano de todas as fontes possíveis
      const state = location.state as LocationState | null;
      
      let selectedPlanId: string | null = null;
      let selectedInterval: 'month' | 'year' = 'month';
      let planSource = '';
      
      // 1. Verificar parâmetros de URL (melhor confiabilidade)
      if (planId && interval) {
        console.log('✅ Plano obtido dos parâmetros da URL:', { 
          planId: planId, 
          interval: interval,
          planName: planName,
          timestamp: timestamp
        });
        selectedPlanId = planId;
        selectedInterval = interval;
        planSource = 'url-params';
      }
      // 2. Verificar estado da navegação (location.state)
      else if (state?.planId && state?.interval) {
        console.log('✅ Plano obtido do estado da navegação:', state);
        selectedPlanId = state.planId;
        selectedInterval = state.interval;
        planSource = 'navigation-state';
      } 
      // 3. Verificar localStorage e sessionStorage como backup
      else {
        // Primeiro tenta no localStorage
        let storedPlanInfoStr = localStorage.getItem('selectedPlanInfo');
        let storageSource = 'localStorage';
        
        // Se não encontrou no localStorage, tenta no sessionStorage
        if (!storedPlanInfoStr) {
          storedPlanInfoStr = sessionStorage.getItem('selectedPlanInfo_backup');
          storageSource = 'sessionStorage';
        }
        
        if (storedPlanInfoStr) {
          try {
            console.log(`🔍 Verificando dados do plano no ${storageSource}:`, storedPlanInfoStr);
            
            const storedPlanInfo = JSON.parse(storedPlanInfoStr) as StoredPlanInfo;
            
            // Verificação mais rigorosa dos dados
            if (!storedPlanInfo.planId) {
              throw new Error('Dados do plano inválidos: ID do plano ausente');
            }
            
            // Verificar se é recente (menos de 1 hora)
            const ageInHours = (Date.now() - storedPlanInfo.timestamp) / (1000 * 60 * 60);
            
            if (ageInHours > 24) {
              console.log(`⚠️ Dados do plano muito antigos (${ageInHours.toFixed(2)} horas), ignorando`);
              localStorage.removeItem('selectedPlanInfo');
              sessionStorage.removeItem('selectedPlanInfo_backup');
              throw new Error('Dados do plano muito antigos');
            }
            
            console.log(`✅ Plano obtido do ${storageSource}:`, storedPlanInfo);
            selectedPlanId = storedPlanInfo.planId;
            selectedInterval = storedPlanInfo.interval || 'month';
            planSource = storageSource;
          } catch (e) {
            console.error(`❌ Erro ao processar dados do plano no ${storageSource}:`, e);
            localStorage.removeItem('selectedPlanInfo');
            sessionStorage.removeItem('selectedPlanInfo_backup');
          }
        } else {
          console.log('⚠️ Nenhum dado de plano encontrado no localStorage ou sessionStorage');
        }
      }
      
      // Se não encontrou o plano, redirecionar para página de preços
      if (!selectedPlanId) {
        console.error('❌ Nenhum plano encontrado para checkout');
        toast({
          title: "Erro no checkout",
          description: "Não foi possível identificar o plano selecionado. Por favor, selecione novamente.",
          variant: "destructive",
        });
        navigate('/pricing', { replace: true });
        return;
      }

      // Marcar que o checkout foi iniciado (para evitar duplicações)
      setCheckoutInitiated(true);

      // Criar a sessão de checkout
      try {
        setLoading(true);
        // Log para depuração
        console.log('🔄 Criando sessão de checkout com:', { planId: selectedPlanId, interval: selectedInterval, source: planSource });
        
        // Agora é seguro remover do localStorage e sessionStorage
        localStorage.removeItem('selectedPlanInfo');
        sessionStorage.removeItem('selectedPlanInfo_backup');
        
        const { url } = await paymentService.createCheckoutSession(selectedPlanId, selectedInterval);
        if (url) {
          console.log('✅ Sessão de checkout criada, redirecionando para:', url);
          window.location.href = url;
        } else {
          throw new Error('Não foi possível criar a sessão de checkout');
        }
      } catch (error) {
        console.error('❌ Erro ao criar sessão de checkout:', error);
        setError('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    initCheckout();
  }, [user, location.state, navigate, checkoutInitiated, location.search, planId, interval, planName, timestamp, authLoading, authRetries]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecionando para o checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para planos
          </button>
        </div>
      </div>
    );
  }

  return null;
}; 