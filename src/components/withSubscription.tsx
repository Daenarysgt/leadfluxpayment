import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/services/paymentService';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

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
          
          // NOVO: Verificação direta no banco de dados via Supabase
          try {
            console.log('🔍 Tentando verificação direta no banco...');
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
              console.log('❌ Usuário não autenticado');
              throw new Error('Usuário não autenticado');
            }
            
            console.log('✅ Usuário autenticado:', user.id);
            
            // Verificar assinatura diretamente via RPC do Supabase
            const { data: subscriptions, error: subError } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .eq('status', 'active');
            
            if (subError) {
              console.error('❌ Erro ao verificar assinatura via Supabase:', subError);
              throw subError;
            }
            
            // Se encontrou uma assinatura ativa
            if (subscriptions && subscriptions.length > 0) {
              const subscription = subscriptions[0];
              const now = Math.floor(Date.now() / 1000);
              
              console.log('📊 Assinatura encontrada diretamente:', {
                id: subscription.id,
                status: subscription.status,
                plan_id: subscription.plan_id,
                current_period_end: subscription.current_period_end,
                valid: subscription.current_period_end > now
              });
              
              // Verificar se ainda está válida
              if (subscription.current_period_end > now) {
                console.log('✅ Assinatura válida e ativa encontrada via verificação direta!');
                
                // Atualizar estado e localStorage
                setHasActiveSubscription(true);
                setNoSubscription(false);
                setIsLoading(false);
                
                localStorage.setItem('subscription_status', 'active');
                localStorage.setItem('subscription_planId', subscription.plan_id);
                localStorage.setItem('subscription_activated_at', Date.now().toString());
                sessionStorage.setItem('subscription_status_backup', 'active');
                sessionStorage.setItem('subscription_planId_backup', subscription.plan_id);
                
                // Retornar antecipadamente, não precisa verificar a API
                return;
              } else {
                console.log('⚠️ Assinatura encontrada, mas período expirado. Continuando verificação...');
              }
            } else {
              console.log('ℹ️ Nenhuma assinatura ativa encontrada via verificação direta');
            }
          } catch (directCheckError) {
            console.error('❌ Erro na verificação direta:', directCheckError);
            // Continuar com a verificação via API normal
          }
          
          // Iniciar a verificação via API padrão
          const apiCheckPromise = paymentService.getCurrentSubscription(3, 3000);
          
          // Verificar dados locais para uma resposta rápida enquanto a API é consultada
          const localStatus = localStorage.getItem('subscription_status');
          const localPlanId = localStorage.getItem('subscription_planId');
          const sessionStatus = sessionStorage.getItem('subscription_status_backup');
          const localTimestamp = localStorage.getItem('subscription_activated_at');
          
          console.log('📊 Status local da assinatura:', { 
            localStorage: localStatus, 
            planId: localPlanId,
            sessionStorage: sessionStatus,
            timestamp: localTimestamp,
            isRecent: localTimestamp ? 
              (Date.now() - Number(localTimestamp) < 24 * 60 * 60 * 1000) : false
          });
          
          // Se temos dados locais recentes, confiar neles temporariamente
          const isRecentLocal = localTimestamp && 
            (Date.now() - Number(localTimestamp) < 24 * 60 * 60 * 1000);
            
          if ((localStatus === 'active' || sessionStatus === 'active') && 
              localPlanId && isRecentLocal) {
            console.log('✅ Dados locais RECENTES indicam assinatura ativa, pré-aprovando acesso');
            if (isMounted) {
              setHasActiveSubscription(true);
              setIsLoading(false);
            }
          }
          
          // Aguardar a verificação da API
          try {
            const subscription = await apiCheckPromise;
            apiCheckCompleted = true;
            
            if (!isMounted) return;
            
            if (subscription) {
              console.log('✅ Assinatura encontrada via API:', subscription);
              
              if (subscription.status === 'active') {
                // Atualizar storage local
                localStorage.setItem('subscription_status', 'active');
                localStorage.setItem('subscription_planId', subscription.planId);
                localStorage.setItem('subscription_activated_at', Date.now().toString());
                sessionStorage.setItem('subscription_status_backup', 'active');
                sessionStorage.setItem('subscription_planId_backup', subscription.planId);
                
                setHasActiveSubscription(true);
                setNoSubscription(false);
            setIsLoading(false);
            return;
              } else {
                console.log(`⚠️ Assinatura encontrada via API, mas status não é ativo: ${subscription.status}`);
              }
            } else {
              console.log('⚠️ API não retornou assinatura válida');
              
              // Se temos dados locais recentes e API não encontrou nada, manter o acesso
              if ((localStatus === 'active' || sessionStatus === 'active') && 
                  localPlanId && isRecentLocal) {
                console.log('⚠️ Mantendo acesso com base nos dados locais RECENTES, apesar de falha na API');
                return;
              }
            }
            
            // Se chegamos aqui, não temos assinatura confirmada pela API nem dados locais válidos
            if (!hasActiveSubscription) {
              setNoSubscription(true);
              setHasActiveSubscription(false);
              setIsLoading(false);
              
              // Limpar dados locais se não são válidos
              if (!isRecentLocal) {
                localStorage.removeItem('subscription_status');
                localStorage.removeItem('subscription_planId');
                sessionStorage.removeItem('subscription_status_backup');
                sessionStorage.removeItem('subscription_planId_backup');
              }
            }
          } catch (apiError) {
            console.error('❌ Erro ao verificar assinatura via API:', apiError);
            
            // Se API falhar mas temos dados locais recentes, manter o acesso
            if ((localStatus === 'active' || sessionStatus === 'active') && 
                localPlanId && isRecentLocal) {
              console.log('⚠️ Mantendo acesso com dados locais devido a erro na API');
              return;
            }
            
            // Se não temos dados locais válidos, mostrar erro
            if (!hasActiveSubscription) {
              setError('Não foi possível verificar sua assinatura. Por favor, tente novamente.');
              setIsLoading(false);
              
              toast({
                variant: 'destructive',
                title: 'Erro ao verificar assinatura',
                description: 'Houve um problema ao verificar sua assinatura. Tente novamente.'
              });
            }
          }
        } catch (error: any) {
          if (!isMounted) return;
          
          console.error('❌ Erro geral na verificação de assinatura:', error);
          
          // Última chance: se temos dados locais recentes, manter acesso
          const localStatus = localStorage.getItem('subscription_status');
          const localPlanId = localStorage.getItem('subscription_planId');
          const localTimestamp = localStorage.getItem('subscription_activated_at');
          const isRecentLocal = localTimestamp && 
            (Date.now() - Number(localTimestamp) < 24 * 60 * 60 * 1000);
            
          if ((localStatus === 'active') && localPlanId && isRecentLocal) {
            console.log('⚠️ Erro geral, mas mantendo acesso com dados locais RECENTES');
            setHasActiveSubscription(true);
            setNoSubscription(false);
            setIsLoading(false);
            return;
          }
          
          setError('Ocorreu um erro ao verificar sua assinatura. Por favor, tente novamente.');
          setIsLoading(false);
          
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