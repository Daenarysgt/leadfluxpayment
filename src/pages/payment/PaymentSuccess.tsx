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
  const [retryCount, setRetryCount] = useState(0);
  const [retryInProgress, setRetryInProgress] = useState(false);
  const sessionId = searchParams.get('session_id');

  // Função para verificar o pagamento com lógica de retry
  const verifyPayment = async (retry = false) => {
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
      if (retry) {
        setRetryInProgress(true);
        console.log(`🔄 Tentativa #${retryCount + 1} de verificação do pagamento...`);
      } else {
        console.log('🔄 Iniciando verificação do pagamento com session_id:', sessionId);
      }
      
      // Verificar se o usuário está autenticado antes de prosseguir
      const { data } = await paymentService.getUserSession();
      if (!data.session) {
        console.error('❌ Erro: Usuário não autenticado');
        setStatus('error');
        setErrorDetails('Usuário não está autenticado');
        setVerifying(false);
        setRetryInProgress(false);
        return;
      }
      
      console.log('👤 Usuário autenticado, prosseguindo com verificação...');
      
      // Verificar status do pagamento
      const result = await paymentService.verifyPaymentStatus(sessionId);
      console.log('✅ Resposta da verificação:', result);
      
      if (result.success) {
        console.log('✅ Pagamento confirmado com sucesso!', result);
        setStatus('success');
        // Atualizar o cache local da assinatura com redundância
        localStorage.setItem('subscription_status', 'active');
        localStorage.setItem('subscription_planId', result.planId || '');
        // Adicionar redundância no sessionStorage
        sessionStorage.setItem('subscription_status_backup', 'active');
        sessionStorage.setItem('subscription_planId_backup', result.planId || '');
        console.log('💾 Status de assinatura salvo em múltiplos storages para segurança');
        
        toast({
          title: "Assinatura ativada com sucesso!",
          description: "Bem-vindo ao LeadFlux. Você já pode começar a usar todas as funcionalidades.",
        });
      } else if (result.error?.includes('Webhook pode ainda não ter processado') && retryCount < 3) {
        // Se o erro indica que o webhook ainda não processou, e estamos dentro do limite de tentativas
        console.log('⏳ Webhook ainda processando, aguardando...');
        setRetryCount(prev => prev + 1);
        
        // Mostrar mensagem para o usuário
        toast({
          title: "Processando pagamento...",
          description: `Aguarde enquanto finalizamos o processamento. Tentativa ${retryCount + 1}/4.`,
        });
        
        // Esperar 5 segundos e tentar novamente
        setTimeout(() => {
          verifyPayment(true);
        }, 5000);
      } else if (result.error?.includes('válida no Stripe, mas não foi possível sincronizar') && retryCount < 5) {
        // Problema de sincronização com o banco - tentar novamente com intervalo maior
        console.log('⚠️ Assinatura válida no Stripe, mas problemas de sincronização. Tentando novamente...');
        setRetryCount(prev => prev + 1);
        
        toast({
          title: "Sincronizando pagamento...",
          description: `Seu pagamento foi aprovado! Estamos sincronizando com nosso sistema. Tentativa ${retryCount + 1}/6.`,
        });
        
        // Aumentar o intervalo para 7 segundos
        setTimeout(() => {
          verifyPayment(true);
        }, 7000);
      } else {
        console.error('❌ Falha na verificação do pagamento:', result);
        setStatus('error');
        setErrorDetails(result.error || 'Não foi possível confirmar seu pagamento');
        
        // Se o erro menciona que a assinatura existe no Stripe, mas não no banco de dados,
        // forneça uma mensagem mais útil para o usuário
        if (result.error?.includes('válida no Stripe')) {
          setErrorDetails(
            'Assinatura válida no Stripe, mas não foi possível sincronizar com o banco de dados. ' +
            'Seu pagamento foi processado, mas precisamos completar a configuração da sua conta. ' +
            'Por favor, contate o suporte mencionando o Session ID.'
          );
          
          toast({
            title: "Pagamento processado!",
            description: "O pagamento foi aprovado, mas precisamos finalizar a configuração da sua conta. Contate o suporte se necessário.",
            variant: "default",
          });
        } else {
          toast({
            title: "Erro na verificação",
            description: "Não foi possível confirmar seu pagamento. Entre em contato com o suporte.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Exceção ao verificar pagamento:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      setStatus('error');
      setErrorDetails(error.response?.data?.error || error.message);
    } finally {
      if (!retryInProgress || retryCount >= 3) {
        setVerifying(false);
      }
      setRetryInProgress(false);
    }
  };

  useEffect(() => {
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
              {retryInProgress 
                ? `Aguarde enquanto finalizamos o processamento (Tentativa ${retryCount}/3)...` 
                : 'Aguarde enquanto confirmamos seu pagamento...'}
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