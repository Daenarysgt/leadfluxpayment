import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/Spinner';
import { toast } from '@/components/ui/use-toast';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutInitiated, setCheckoutInitiated] = useState(false);

  useEffect(() => {
    const initCheckout = async () => {
      // Se já iniciou o checkout, não faça novamente
      if (checkoutInitiated) return;
      
      // Verifica autenticação
      if (!user) {
        console.log('❌ Usuário não autenticado, redirecionando para login');
        navigate('/login');
        return;
      }
      
      // Log para depuração - Verificação completa do estado
      console.log('📌 Estado do componente de checkout:', {
        user: user?.id,
        locationState: location.state,
        hasLocalStorage: !!localStorage.getItem('selectedPlanInfo'),
        hasSessionStorage: !!sessionStorage.getItem('selectedPlanInfo_backup')
      });
      
      // Tenta obter o plano do estado de navegação
      const state = location.state as LocationState | null;
      
      // Se não tiver no estado, tenta obter do localStorage ou sessionStorage
      let planId: string | null = null;
      let interval: 'month' | 'year' = 'month';
      let planSource = '';
      
      if (state?.planId && state?.interval) {
        console.log('✅ Plano obtido do estado da navegação:', state);
        planId = state.planId;
        interval = state.interval;
        planSource = 'navigation-state';
      } else {
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
            planId = storedPlanInfo.planId;
            interval = storedPlanInfo.interval || 'month';
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
      if (!planId) {
        console.error('❌ Nenhum plano encontrado para checkout');
        toast({
          title: "Erro no checkout",
          description: "Não foi possível identificar o plano selecionado. Por favor, selecione novamente.",
          variant: "destructive",
        });
        navigate('/pricing');
        return;
      }

      // Marcar que o checkout foi iniciado (para evitar duplicações)
      setCheckoutInitiated(true);

      // Criar a sessão de checkout
      try {
        setLoading(true);
        // Log para depuração
        console.log('🔄 Criando sessão de checkout com:', { planId, interval, source: planSource });
        
        // Agora é seguro remover do localStorage e sessionStorage
        localStorage.removeItem('selectedPlanInfo');
        sessionStorage.removeItem('selectedPlanInfo_backup');
        
        const { url } = await paymentService.createCheckoutSession(planId, interval);
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
  }, [user, location.state, navigate, checkoutInitiated]);

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