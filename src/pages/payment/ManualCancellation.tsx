import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Check } from 'lucide-react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function ManualCancellationPage() {
  const [subscriptionId, setSubscriptionId] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    details?: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCancelBySubscriptionId = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscriptionId.trim()) {
      setError('Por favor, informe o ID da assinatura (subscription_id)');
      return;
    }
    
    await performCancellation({ subscription_id: subscriptionId.trim() });
  };

  const handleCancelByUserId = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError('Por favor, informe o ID do usuário');
      return;
    }
    
    await performCancellation({ user_id: userId.trim() });
  };

  const performCancellation = async (params: { subscription_id?: string; user_id?: string }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      const response = await axios.post(
        `${API_URL}/payment/admin/cancel-subscription`,
        params,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );
      
      setResult({
        success: response.data.success,
        message: response.data.message,
        details: response.data.results
      });
    } catch (err: any) {
      console.error('Erro ao cancelar assinatura:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Erro desconhecido ao cancelar assinatura'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cancelamento Manual de Assinatura</h1>
        <p className="text-gray-500 mb-6">
          Esta ferramenta administrativa permite cancelar manualmente uma assinatura no banco de dados.
          Use apenas para fins de diagnóstico ou correção de problemas.
        </p>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && result.success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Sucesso</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.details && (
                <div className="mt-2 text-xs">
                  <pre className="bg-black/5 p-2 rounded">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="subscription_id" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subscription_id">Por ID da Assinatura</TabsTrigger>
            <TabsTrigger value="user_id">Por ID do Usuário</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription_id">
            <Card>
              <CardHeader>
                <CardTitle>Cancelar por ID da Assinatura</CardTitle>
                <CardDescription>
                  Informe o ID da assinatura (subscription_id) do Stripe para cancelá-la.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleCancelBySubscriptionId}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscription_id">ID da Assinatura</Label>
                    <Input
                      id="subscription_id"
                      placeholder="sub_..."
                      value={subscriptionId}
                      onChange={(e) => setSubscriptionId(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      O ID da assinatura geralmente começa com "sub_"
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cancelar Assinatura
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="user_id">
            <Card>
              <CardHeader>
                <CardTitle>Cancelar por ID do Usuário</CardTitle>
                <CardDescription>
                  Cancela todas as assinaturas ativas deste usuário.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleCancelByUserId}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_id">ID do Usuário</Label>
                    <Input
                      id="user_id"
                      placeholder="ID do usuário"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cancelar Assinaturas do Usuário
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/account')}>
            Voltar para Conta
          </Button>
          
          <Button variant="outline" onClick={() => navigate('/diagnostic')}>
            Ir para Diagnóstico
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ManualCancellationPage; 