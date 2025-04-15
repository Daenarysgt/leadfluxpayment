import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/services/paymentService';
import { Loader2 } from 'lucide-react';

export const withSubscription = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const checkSubscription = async () => {
        try {
          const subscription = await paymentService.getCurrentSubscription();
          
          // Verifica se tem assinatura ativa
          if (!subscription || subscription.status !== 'active') {
            navigate('/pricing', { 
              state: { 
                message: 'É necessário ter uma assinatura ativa para acessar esta área.'
              }
            });
            return;
          }

          setHasActiveSubscription(true);
        } catch (error) {
          console.error('Erro ao verificar assinatura:', error);
          navigate('/pricing', { 
            state: { 
              message: 'Erro ao verificar assinatura. Por favor, tente novamente.'
            }
          });
        } finally {
          setIsLoading(false);
        }
      };

      checkSubscription();
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

    // Só renderiza o componente se tiver assinatura ativa
    return hasActiveSubscription ? <WrappedComponent {...props} /> : null;
  };
}; 