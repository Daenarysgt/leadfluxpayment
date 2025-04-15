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
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Tenta obter o plano do estado de navegação
    const state = location.state as LocationState | null;
    
    // Se não tiver no estado, tenta obter do localStorage
    let planId: string | null = null;
    let interval: 'month' | 'year' = 'month';
    
    if (state?.planId && state?.interval) {
      console.log('Plano obtido do estado da navegação:', state);
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
            console.log('Plano obtido do localStorage:', storedPlanInfo);
            planId = storedPlanInfo.planId;
            interval = storedPlanInfo.interval;
            // Remove do localStorage para evitar uso futuro indevido
            localStorage.removeItem('selectedPlanInfo');
          }
        }
      } catch (e) {
        console.error('Erro ao processar dados do plano no localStorage:', e);
        localStorage.removeItem('selectedPlanInfo');
      }
    }
    
    if (!planId) {
      console.error('Nenhum plano encontrado para checkout');
      toast({
        title: "Erro no checkout",
        description: "Não foi possível identificar o plano selecionado. Por favor, selecione novamente.",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }

    const createCheckoutSession = async () => {
      try {
        setLoading(true);
        // Log para depuração
        console.log('Criando sessão de checkout com:', { planId, interval });
        
        const { url } = await paymentService.createCheckoutSession(planId, interval);
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('Não foi possível criar a sessão de checkout');
        }
      } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        setError('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    createCheckoutSession();
  }, [user, location.state, navigate]);

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