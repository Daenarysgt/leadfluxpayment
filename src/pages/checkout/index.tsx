import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/Spinner';
import { toast } from '@/components/ui/use-toast';
import { checkoutStateService } from '@/services/checkoutStateService';

interface LocationState {
  planId: string;
  interval: 'month' | 'year';
  checkoutSessionId?: string;
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
        hasCheckoutData: checkoutStateService.hasPlanSelection()
      });
      
      // Estratégia para obter os dados do plano em ordem de prioridade:
      // 1. Do estado da navegação (vindo do redirect)
      // 2. Do serviço centralizado de checkout (que verifica sessionStorage e localStorage)
      
      let planId: string | null = null;
      let interval: 'month' | 'year' = 'month';
      let planSource = '';
      
      // 1. Verificar estado da navegação
      const state = location.state as LocationState | null;
      if (state?.planId && state?.interval) {
        console.log('✅ Plano obtido do estado da navegação:', state);
        planId = state.planId;
        interval = state.interval;
        planSource = 'navigation-state';
      }
      // 2. Verificar serviço de checkout
      else {
        try {
          const checkoutData = checkoutStateService.getPlanSelection();
          if (checkoutData) {
            console.log('✅ Plano obtido do serviço de checkout:', checkoutData);
            planId = checkoutData.planId;
            interval = checkoutData.interval;
            planSource = 'checkout-service';
          }
        } catch (err) {
          console.error('❌ Erro ao obter dados do plano do serviço de checkout:', err);
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
        
        // Limpar dados de checkout agora que vamos criar a sessão no Stripe
        try {
          checkoutStateService.clearPlanSelection();
        } catch (err) {
          console.error('❌ Erro ao limpar dados do plano:', err);
        }
        
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