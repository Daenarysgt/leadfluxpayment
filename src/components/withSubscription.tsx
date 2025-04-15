import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/services/paymentService';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const withSubscription = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
      let isMounted = true;
      const checkSubscription = async () => {
        try {
          const subscription = await paymentService.getCurrentSubscription();
          
          // Verifica se o componente ainda está montado antes de atualizar o estado
          if (!isMounted) return;
          
          // Verifica se tem assinatura ativa
          if (!subscription) {
            console.log('Usuário sem assinatura ativa');
            navigate('/pricing', { 
              state: { 
                message: 'É necessário ter uma assinatura ativa para acessar esta área.'
              }
            });
            return;
          }
          
          // Verifica se o status da assinatura é ativo
          if (subscription.status !== 'active') {
            console.log(`Assinatura encontrada, mas status não é ativo: ${subscription.status}`);
            navigate('/pricing', { 
              state: { 
                message: `Sua assinatura atual está com status "${subscription.status}". É necessário uma assinatura ativa.`
              }
            });
            return;
          }
          
          // Assinatura ativa encontrada
          setHasActiveSubscription(true);
        } catch (error) {
          if (!isMounted) return;
          
          console.error('Erro ao verificar assinatura:', error);
          setError('Não foi possível verificar sua assinatura. Por favor, tente novamente.');
          
          // Mostrar toast de erro
          toast({
            variant: 'destructive',
            title: 'Erro ao verificar assinatura',
            description: 'Houve um problema ao verificar sua assinatura. Você será redirecionado.'
          });
          
          // Redirecionar para página de preços após um breve intervalo
          setTimeout(() => {
            if (isMounted) {
              navigate('/pricing', { 
                state: { 
                  message: 'Erro ao verificar assinatura. Por favor, tente novamente.'
                }
              });
            }
          }, 2000);
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