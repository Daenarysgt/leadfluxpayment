import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Calendar, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentService } from '@/services/paymentService';
import { toast } from '@/components/ui/use-toast';
import { withSubscription } from '@/components/withSubscription';
import { useAuth } from '@/hooks/useAuth';

interface Subscription {
  planId: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

function AccountPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const subscriptionData = await paymentService.getCurrentSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Erro ao buscar assinatura:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os dados da sua assinatura.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleManageSubscription = async () => {
    try {
      setIsRedirecting(true);
      const { url } = await paymentService.createCustomerPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Erro ao acessar portal de assinatura:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível acessar o portal de gerenciamento da assinatura.',
      });
      setIsRedirecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>
      
      <div className="grid gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Seus dados de conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>
              Detalhes e gerenciamento da sua assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-sm text-gray-500">Plano</p>
                    <p className="font-bold text-xl">{subscription.planId.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-500">Status</p>
                    <div className="flex items-center gap-2">
                      {subscription.status === 'active' ? (
                        <>
                          <Check className="w-5 h-5 text-green-500" />
                          <p className="font-medium text-green-600">Ativa</p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                          <p className="font-medium text-amber-600">
                            {subscription.status === 'canceled' ? 'Cancelada' : 
                             subscription.status === 'past_due' ? 'Pagamento Pendente' : 
                             subscription.status}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="font-medium text-sm text-gray-500">
                      Período atual
                    </p>
                  </div>
                  <p>
                    Válido até {' '}
                    <span className="font-medium">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </span>
                  </p>
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-amber-600 mt-1 text-sm">
                      Sua assinatura não será renovada ao final do período atual.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Você não possui uma assinatura ativa.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/pricing')}
                >
                  Ver planos disponíveis
                </Button>
              </div>
            )}
          </CardContent>
          {subscription && (
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleManageSubscription}
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Gerenciar assinatura
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default withSubscription(AccountPage); 