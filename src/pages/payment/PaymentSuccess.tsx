import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { paymentService } from '@/services/paymentService';
import { toast } from '@/components/ui/use-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      // Log para depuração - parâmetro da URL
      console.log('📋 Parâmetros da URL:', Object.fromEntries(searchParams.entries()));
      console.log('🔑 Session ID:', sessionId);
      
      if (!sessionId) {
        console.error('❌ Erro: Nenhum session_id encontrado na URL');
        setStatus('error');
        setErrorDetails('Nenhum ID de sessão encontrado na URL');
        setVerifying(false);
        return;
      }

      try {
        console.log('🔄 Iniciando verificação do pagamento com session_id:', sessionId);
        
        // Verificar se o usuário está autenticado antes de prosseguir
        const { data } = await paymentService.getUserSession();
        if (!data.session) {
          console.error('❌ Erro: Usuário não autenticado');
          setStatus('error');
          setErrorDetails('Usuário não está autenticado');
          setVerifying(false);
          return;
        }
        
        console.log('👤 Usuário autenticado, prosseguindo com verificação...');
        
        // Verificar status do pagamento
        const result = await paymentService.verifyPaymentStatus(sessionId);
        console.log('✅ Resposta da verificação:', result);
        
        if (result.success) {
          console.log('✅ Pagamento confirmado com sucesso!', result);
          setStatus('success');
          // Atualizar o cache local da assinatura
          localStorage.setItem('subscription_status', 'active');
          localStorage.setItem('subscription_planId', result.planId || '');
          
          toast({
            title: "Assinatura ativada com sucesso!",
            description: "Bem-vindo ao LeadFlux. Você já pode começar a usar todas as funcionalidades.",
          });
        } else {
          console.error('❌ Falha na verificação do pagamento:', result);
          setStatus('error');
          setErrorDetails(result.error || 'Não foi possível confirmar seu pagamento');
          
          toast({
            title: "Erro na verificação",
            description: "Não foi possível confirmar seu pagamento. Entre em contato com o suporte.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('❌ Exceção ao verificar pagamento:', error);
        console.error('Detalhes do erro:', error.response?.data || error.message);
        setStatus('error');
        setErrorDetails(error.response?.data?.error || error.message);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, searchParams]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleTryAgain = () => {
    navigate('/pricing');
  };

  const handleSupport = () => {
    // Redirecionar para página de suporte ou abrir modal
    window.open('mailto:suporte@leadflux.digital?subject=Problema com pagamento&body=Session ID: ' + sessionId, '_blank');
  };

  const handleRunDiagnostic = async () => {
    try {
      setShowDiagnostic(true);
      const diagnosticResult = await paymentService.diagnosticSubscription();
      setDiagnostic(diagnosticResult);
      console.log('🔍 Diagnóstico de assinatura:', diagnosticResult);
    } catch (error) {
      console.error('❌ Erro ao executar diagnóstico:', error);
      toast({
        title: "Erro no diagnóstico",
        description: "Não foi possível realizar o diagnóstico de assinatura.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        {verifying ? (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Verificando pagamento</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto confirmamos seu pagamento...
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Session ID: {sessionId || 'Não encontrado'}
            </p>
          </div>
        ) : status === 'success' ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Pagamento confirmado!</h2>
            <p className="text-muted-foreground mb-6">
              Sua assinatura foi ativada com sucesso. Aproveite todas as funcionalidades do LeadFlux!
            </p>
            <Button onClick={handleContinue} className="w-full">
              Ir para o Dashboard
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground mb-2">
              Não foi possível confirmar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.
            </p>
            {errorDetails && (
              <p className="text-xs text-red-500 mb-4 p-2 bg-red-50 rounded">
                Detalhes: {errorDetails}
              </p>
            )}
            <p className="text-xs text-muted-foreground mb-4">
              Session ID: {sessionId || 'Não encontrado'}
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleTryAgain} variant="outline" className="w-full">
                Voltar para Planos
              </Button>
              <Button onClick={handleSupport} variant="ghost" className="w-full">
                Contatar Suporte
              </Button>
              <Button onClick={handleRunDiagnostic} variant="ghost" className="w-full text-xs">
                Executar Diagnóstico
              </Button>
            </div>

            {showDiagnostic && diagnostic && (
              <div className="mt-6 text-left border rounded p-3 bg-slate-50 text-xs">
                <h3 className="font-semibold mb-2">Diagnóstico da Assinatura:</h3>
                <p><strong>Conclusão:</strong> {diagnostic.conclusion}</p>
                
                <div className="mt-2">
                  <p><strong>Banco de Dados:</strong> {diagnostic.databaseSubscription.exists ? '✅ Encontrada' : '❌ Não encontrada'}</p>
                  {diagnostic.databaseSubscription.error && (
                    <p className="text-red-500">Erro: {diagnostic.databaseSubscription.error.message}</p>
                  )}
                </div>
                
                <div className="mt-2">
                  <p><strong>Stripe:</strong> {diagnostic.stripeSubscription.exists ? '✅ Encontrada' : '❌ Não encontrada'}</p>
                  {diagnostic.stripeSubscription.error && (
                    <p className="text-red-500">Erro: {diagnostic.stripeSubscription.error.message}</p>
                  )}
                </div>
                
                {diagnostic.databaseSubscription.exists && diagnostic.databaseSubscription.data && (
                  <p className="mt-2"><strong>Plano:</strong> {diagnostic.databaseSubscription.data.plan_id}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 