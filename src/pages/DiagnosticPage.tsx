import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, RefreshCw, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function DiagnosticPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados de diagnóstico do backend
      const diagnosticResult = await paymentService.diagnosticSubscription();
      setDiagnosticData(diagnosticResult);
      
      // Carregar assinatura atual
      const currentSubscription = await paymentService.getCurrentSubscription();
      setSubscription(currentSubscription);
      
      // Carregar dados do localStorage
      const localData = {
        subscriptionStatus: localStorage.getItem('subscription_status'),
        subscriptionPlanId: localStorage.getItem('subscription_planId'),
        activatedAt: localStorage.getItem('subscription_activated_at'),
        sessionStorageStatus: sessionStorage.getItem('subscription_status_backup'),
        sessionStoragePlanId: sessionStorage.getItem('subscription_planId_backup')
      };
      setLocalStorageData(localData);
      
    } catch (error) {
      console.error('Erro ao carregar diagnóstico:', error);
      toast({
        title: "Erro ao carregar diagnóstico",
        description: "Não foi possível recuperar os dados de diagnóstico",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
      toast({
        title: "Diagnóstico atualizado",
        description: "Os dados foram atualizados com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar diagnóstico:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleClearLocalStorage = () => {
    try {
      localStorage.removeItem('subscription_status');
      localStorage.removeItem('subscription_planId');
      localStorage.removeItem('subscription_activated_at');
      sessionStorage.removeItem('subscription_status_backup');
      sessionStorage.removeItem('subscription_planId_backup');
      
      loadData();
      
      toast({
        title: "Dados locais limpos",
        description: "Os dados de assinatura em armazenamento local foram removidos",
      });
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
      toast({
        title: "Erro ao limpar dados",
        description: "Não foi possível remover os dados locais",
        variant: "destructive"
      });
    }
  };
  
  const handleFixLocalStorage = () => {
    try {
      if (subscription) {
        localStorage.setItem('subscription_status', 'active');
        localStorage.setItem('subscription_planId', subscription.planId);
        sessionStorage.setItem('subscription_status_backup', 'active');
        sessionStorage.setItem('subscription_planId_backup', subscription.planId);
        localStorage.setItem('subscription_activated_at', Date.now().toString());
        
        loadData();
        
        toast({
          title: "Dados locais corrigidos",
          description: "Os dados de assinatura em armazenamento local foram restaurados",
        });
      } else {
        toast({
          title: "Não foi possível corrigir",
          description: "Não há dados de assinatura disponíveis para restaurar",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao restaurar localStorage:', error);
      toast({
        title: "Erro ao restaurar dados",
        description: "Não foi possível restaurar os dados locais",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')} 
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Diagnóstico de Assinatura</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh} 
            className="ml-auto p-2 mr-2"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/payment/manual-cancellation')}
          >
            Cancelamento Manual
          </Button>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando diagnóstico...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Status resumido */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Status da Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">API</h3>
                    <div className={`flex items-center ${subscription ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${subscription ? 'bg-green-600' : 'bg-red-600'}`} />
                      {subscription ? 'Ativa' : 'Inativa'}
                    </div>
                    {subscription && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Plano: {subscription.planId}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Local Storage</h3>
                    <div className={`flex items-center ${localStorageData?.subscriptionStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${localStorageData?.subscriptionStatus === 'active' ? 'bg-green-600' : 'bg-red-600'}`} />
                      {localStorageData?.subscriptionStatus === 'active' ? 'Ativa' : 'Inativa'}
                    </div>
                    {localStorageData?.subscriptionPlanId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Plano: {localStorageData.subscriptionPlanId}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex mt-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearLocalStorage}
                    className="text-xs"
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    Limpar dados locais
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFixLocalStorage}
                    className="text-xs"
                    disabled={!subscription}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Restaurar dados locais
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Detalhes do diagnóstico */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Detalhes do Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                {diagnosticData ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-1">Conclusão:</h3>
                      <p className="text-sm bg-gray-100 p-2 rounded">{diagnosticData.conclusion}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Banco de Dados</h3>
                        <div className={`text-sm ${diagnosticData.databaseSubscription.exists ? 'text-green-600' : 'text-red-600'}`}>
                          {diagnosticData.databaseSubscription.exists ? '✅ Encontrada' : '❌ Não encontrada'}
                        </div>
                        {diagnosticData.databaseSubscription.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {diagnosticData.databaseSubscription.error.code}: {diagnosticData.databaseSubscription.error.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Stripe</h3>
                        <div className={`text-sm ${diagnosticData.stripeSubscription.exists ? 'text-green-600' : 'text-red-600'}`}>
                          {diagnosticData.stripeSubscription.exists ? '✅ Encontrada' : '❌ Não encontrada'}
                        </div>
                        {diagnosticData.stripeSubscription.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {diagnosticData.stripeSubscription.error.code}: {diagnosticData.stripeSubscription.error.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Dados detalhados */}
                    <div className="border-t mt-4 pt-4">
                      <p className="text-xs text-muted-foreground mb-2">Dados detalhados do diagnóstico:</p>
                      <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(diagnosticData, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado de diagnóstico disponível</p>
                )}
              </CardContent>
            </Card>
            
            {/* Armazenamento Local */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Armazenamento Local</CardTitle>
              </CardHeader>
              <CardContent>
                {localStorageData ? (
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                    <pre>{JSON.stringify(localStorageData, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado local disponível</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 