import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    useEffect(() => {
      let isMounted = true;
      let apiCheckCompleted = false;
      
      const checkSubscription = async () => {
        try {
          console.log('🔍 Verificando assinatura do usuário...');
          
          // Iniciar a verificação via API imediatamente
          const apiCheckPromise = paymentService.getCurrentSubscription();
          
          // Verificar dados locais para uma resposta rápida enquanto a API é consultada
          const localStatus = localStorage.getItem('subscription_status');
          const localPlanId = localStorage.getItem('subscription_planId');
          const sessionStatus = sessionStorage.getItem('subscription_status_backup');
          
          console.log('📊 Status local da assinatura:', { 
            localStorage: localStatus, 
            planId: localPlanId,
            sessionStorage: sessionStatus 
          });
          
          // Mostrar indicador de carregamento por pelo menos 500ms para evitar flash de conteúdo
          const minLoadingTime = new Promise(resolve => setTimeout(resolve, 500));
          
          // Se temos status local ativo, podemos mostrar conteúdo mais rápido
          // mas ainda aguardamos a verificação da API em segundo plano
          if ((localStatus === 'active' || sessionStatus === 'active') && localPlanId) {
            console.log('✅ Dados locais indicam assinatura ativa, pré-aprovando acesso');
            if (isMounted) {
              setHasActiveSubscription(true);
              setIsLoading(false);
            }
          }
          
          // Aguardar a conclusão da verificação da API
          const [subscription] = await Promise.all([apiCheckPromise, minLoadingTime]);
          apiCheckCompleted = true;
          
          // Verifica se o componente ainda está montado antes de atualizar o estado
          if (!isMounted) return;
          
          // Verifica se tem assinatura ativa
          if (!subscription) {
            console.log('⚠️ Usuário sem assinatura ativa segundo a API');
            
            // Se não tem na API mas tem dados locais recentes (menos de 1 dia)
            // ainda podemos manter o acesso temporariamente
            const localTimestamp = localStorage.getItem('subscription_activated_at');
            const isRecent = localTimestamp && 
              (Date.now() - Number(localTimestamp) < 24 * 60 * 60 * 1000);
              
            if ((localStatus === 'active' || sessionStatus === 'active') && 
                localPlanId && isRecent) {
              console.log('⚠️ Mantendo acesso com base nos dados locais RECENTES de assinatura');
              return;
            }
            
            setNoSubscription(true);
            setHasActiveSubscription(false);
            setIsLoading(false);
            
            // Limpar dados locais desatualizados
            localStorage.removeItem('subscription_status');
            localStorage.removeItem('subscription_planId');
            sessionStorage.removeItem('subscription_status_backup');
            sessionStorage.removeItem('subscription_planId_backup');
            
            return;
          }
          
          // Verifica se o status da assinatura é ativo
          if (subscription.status !== 'active') {
            console.log(`⚠️ Assinatura encontrada, mas status não é ativo: ${subscription.status}`);
            setNoSubscription(true);
            setHasActiveSubscription(false);
            setIsLoading(false);
            return;
          }
          
          // Assinatura ativa encontrada - atualizar dados locais
          console.log('✅ Assinatura ativa encontrada via API:', subscription);
          
          // Atualizar armazenamento local com dados confirmados pela API
          localStorage.setItem('subscription_status', 'active');
          localStorage.setItem('subscription_planId', subscription.planId);
          localStorage.setItem('subscription_activated_at', Date.now().toString());
          sessionStorage.setItem('subscription_status_backup', 'active');
          sessionStorage.setItem('subscription_planId_backup', subscription.planId);
          
          setHasActiveSubscription(true);
          setNoSubscription(false);
          setIsLoading(false);
        } catch (error) {
          if (!isMounted) return;
          
          console.error('❌ Erro ao verificar assinatura:', error);
          
          // Se ainda não confirmamos com a API, podemos usar dados locais como fallback
          if (!apiCheckCompleted) {
            const localStatus = localStorage.getItem('subscription_status');
            const localPlanId = localStorage.getItem('subscription_planId');
            const sessionStatus = sessionStorage.getItem('subscription_status_backup');
            const localTimestamp = localStorage.getItem('subscription_activated_at');
            
            // Verificar se os dados locais são recentes (menos de 1 dia)
            const isRecent = localTimestamp && 
              (Date.now() - Number(localTimestamp) < 24 * 60 * 60 * 1000);
              
            if ((localStatus === 'active' || sessionStatus === 'active') && 
                localPlanId && isRecent) {
              console.log('⚠️ Erro ao verificar com API, usando dados locais RECENTES como fallback');
              setHasActiveSubscription(true);
              setNoSubscription(false);
              setIsLoading(false);
              return;
            }
          }
          
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
    }, [navigate]);

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