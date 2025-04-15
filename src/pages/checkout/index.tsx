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
}

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoading(true);
        
        // Verificar autenticação
        if (!user) {
          console.log('❌ Usuário não autenticado, redirecionando para login');
          // Salvar informações do plano antes de redirecionar
          if (location.state) {
            localStorage.setItem('selectedPlanInfo', JSON.stringify({
              ...location.state,
              timestamp: Date.now()
            }));
          }
          navigate('/login');
          return;
        }
        
        // Verificar se já tem assinatura ativa
        console.log('🔍 Verificando assinatura existente...');
        const currentSubscription = await paymentService.getCurrentSubscription();
        
        if (currentSubscription?.status === 'active') {
          console.log('⚠️ Usuário já possui assinatura ativa');
          toast({
            title: "Assinatura já existe",
            description: "Você já possui uma assinatura ativa.",
            variant: "default",
          });
          navigate('/dashboard');
          return;
        }
        
        // Tenta obter o plano do estado de navegação
        const state = location.state as LocationState | null;
        
        // Se não tiver no estado, tenta obter do localStorage
        let planId: string | null = null;
        let interval: 'month' | 'year' = 'month';
        
        if (state?.planId && state?.interval) {
          console.log('📋 Plano obtido do estado da navegação:', state);
          planId = state.planId;
          interval = state.interval;
        } else {
          // Tenta obter do localStorage
          try {
            const storedPlanInfoStr = localStorage.getItem('selectedPlanInfo');
            if (storedPlanInfoStr) {
              const storedPlanInfo = JSON.parse(storedPlanInfoStr) as StoredPlanInfo;
              // Verifica se é recente (menos de 24h)
              if (Date.now() - storedPlanInfo.timestamp < 24 * 60 * 60 * 1000) {
                console.log('📋 Plano obtido do localStorage:', storedPlanInfo);
                planId = storedPlanInfo.planId;
                interval = storedPlanInfo.interval;
                // Remove do localStorage para evitar uso futuro indevido
                localStorage.removeItem('selectedPlanInfo');
              }
            }
          } catch (e) {
            console.error('❌ Erro ao processar dados do plano no localStorage:', e);
            localStorage.removeItem('selectedPlanInfo');
          }
        }
        
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

        // Criar sessão de checkout
        console.log('🔄 Criando sessão de checkout com:', { planId, interval });
        const { url } = await paymentService.createCheckoutSession(planId, interval);
        
        if (url) {
          console.log('✅ Redirecionando para Stripe:', url);
          window.location.href = url;
        } else {
          throw new Error('Não foi possível criar a sessão de checkout');
        }
      } catch (error: any) {
        console.error('❌ Erro no processo de checkout:', error);
        setError(error.message || 'Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [user, location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Preparando seu checkout...</p>
          <p className="text-sm text-muted-foreground/60">Você será redirecionado em instantes</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Voltar para planos
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}; 