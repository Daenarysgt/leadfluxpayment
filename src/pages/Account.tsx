import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Calendar, Check, AlertCircle, ShieldAlert } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [cancelSubscriptionLoading, setCancelSubscriptionLoading] = useState(false);
  const [checkCancelledLoading, setCheckCancelledLoading] = useState(false);
  const [cancelledSubscription, setCancelledSubscription] = useState<any>(null);
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

    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const sub = await paymentService.getCurrentSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

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

  const handleCancelSubscription = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura?')) {
      return;
    }

    setCancelSubscriptionLoading(true);
    try {
      await paymentService.cancelSubscription();
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso. Você ainda pode usar o sistema até o fim do período atual.",
      });
      setTimeout(() => {
        loadSubscription();
      }, 1000);
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: "Erro ao cancelar assinatura",
        description: "Ocorreu um problema ao tentar cancelar sua assinatura. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCancelSubscriptionLoading(false);
    }
  };

  const handleCheckCancelledSubscription = async () => {
    setCheckCancelledLoading(true);
    try {
      const cancelledSub = await paymentService.checkCanceledSubscription();
      setCancelledSubscription(cancelledSub);
      
      if (cancelledSub) {
        toast({
          title: "Assinatura cancelada encontrada",
          description: `Assinatura do plano ${cancelledSub.planId} cancelada em ${cancelledSub.canceledAt.toLocaleDateString()}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Nenhuma assinatura cancelada",
          description: "Não foi encontrada nenhuma assinatura cancelada para sua conta.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Erro ao verificar assinaturas canceladas:', error);
      toast({
        title: "Erro ao verificar assinaturas",
        description: "Ocorreu um problema ao verificar assinaturas canceladas.",
        variant: "destructive"
      });
    } finally {
      setCheckCancelledLoading(false);
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
              
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleCheckCancelledSubscription}
                disabled={checkCancelledLoading}
              >
                {checkCancelledLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="mr-2 h-4 w-4" />
                )}
                Verificar Cancelamento
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Área de assinaturas canceladas */}
      {cancelledSubscription && (
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-800">Assinatura Cancelada Encontrada</CardTitle>
            <CardDescription className="text-yellow-700">
              Os seguintes dados de uma assinatura cancelada foram encontrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-yellow-700">ID da Assinatura</p>
                  <p className="font-medium text-yellow-900">{cancelledSubscription.id}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-yellow-700">Plano</p>
                  <p className="font-medium text-yellow-900">{cancelledSubscription.planId.toUpperCase()}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm text-yellow-700">Data de Cancelamento</p>
                <p className="font-medium text-yellow-900">
                  {cancelledSubscription.canceledAt.toLocaleDateString('pt-BR')} às {cancelledSubscription.canceledAt.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto bg-white"
              onClick={() => setCancelledSubscription(null)}
            >
              Esconder esta informação
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
        >
          Voltar ao Dashboard
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/diagnostic')}
        >
          Diagnóstico de Assinatura
        </Button>
      </div>
    </div>
  );
}

export default withSubscription(AccountPage); 