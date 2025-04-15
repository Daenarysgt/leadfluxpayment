import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '@/services/paymentService';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export const withSubscription = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [noSubscription, setNoSubscription] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      let isMounted = true;
      const checkSubscription = async () => {
        try {
          // Se estiver na rota de checkout ou em rotas relacionadas a pagamento, não bloquear
          if (location.pathname.startsWith('/checkout') || 
              location.pathname.startsWith('/payment/')) {
            setHasActiveSubscription(true);
            setIsLoading(false);
            return;
          }

          console.log('🔍 Verificando assinatura do usuário...');
          const subscription = await paymentService.getCurrentSubscription();
          
          // Verifica se o componente ainda está montado antes de atualizar o estado
          if (!isMounted) return;
          
          // Verifica se tem assinatura ativa
          if (!subscription) {
            console.log('⚠️ Usuário sem assinatura ativa');
            setNoSubscription(true);
            setIsLoading(false);
            return;
          }
          
          // Verifica se o status da assinatura é ativo
          if (subscription.status !== 'active') {
            console.log(`⚠️ Assinatura encontrada, mas status não é ativo: ${subscription.status}`);
            setNoSubscription(true);
            setIsLoading(false);
            return;
          }
          
          // Assinatura ativa encontrada
          console.log('✅ Assinatura ativa encontrada:', subscription);
          setHasActiveSubscription(true);
        } catch (error) {
          if (!isMounted) return;
          
          console.error('❌ Erro ao verificar assinatura:', error);
          setError('Não foi possível verificar sua assinatura. Por favor, tente novamente.');
          
          // Mostrar toast de erro
          toast({
            variant: 'destructive',
            title: 'Erro ao verificar assinatura',
            description: 'Houve um problema ao verificar sua assinatura. Tente novamente.'
          });
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      checkSubscription();
      
      // Cleanup function
      return () => {
        isMounted = false;
      };
    }, [navigate, location.pathname]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600">Verificando sua assinatura...</p>
          </div>
        </div>
      );
    }
    
    if (noSubscription) {
      // Verificar se há um plano selecionado no localStorage
      const storedPlanInfo = localStorage.getItem('selectedPlanInfo');
      if (storedPlanInfo) {
        try {
          const planInfo = JSON.parse(storedPlanInfo);
          const isRecent = Date.now() - planInfo.timestamp < 24 * 60 * 60 * 1000;
          
          if (isRecent && planInfo.planId) {
            // Se houver um plano selecionado, redirecionar para o checkout
            navigate('/checkout', {
              state: {
                planId: planInfo.planId,
                interval: planInfo.interval || 'month'
              }
            });
            return null;
          }
        } catch (e) {
          localStorage.removeItem('selectedPlanInfo');
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
            <div className="text-amber-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Assinatura necessária</h2>
            <p className="text-gray-600 mb-6">
              Para acessar esta área, você precisa ter uma assinatura ativa. Escolha um plano para continuar.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/pricing')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Ver Planos
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Voltar para Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p className="text-gray-800 font-medium mb-1">Erro ao verificar assinatura</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    // Só renderiza o componente se tiver assinatura ativa
    return hasActiveSubscription ? <WrappedComponent {...props} /> : null;
  };
}; 