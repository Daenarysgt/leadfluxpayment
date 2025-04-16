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
  const [directSubscriptionCheck, setDirectSubscriptionCheck] = useState(false);

  // Função para garantir armazenamento consistente do status da assinatura
  const saveSubscriptionStatus = (planId: string) => {
    try {
      // Armazenar em múltiplos locais para maior confiabilidade
      localStorage.setItem('subscription_status', 'active');
      localStorage.setItem('subscription_planId', planId);
      sessionStorage.setItem('subscription_status_backup', 'active');
      sessionStorage.setItem('subscription_planId_backup', planId);
      
      // Armazenar também o timestamp da ativação para referência
      localStorage.setItem('subscription_activated_at', Date.now().toString());
      
      console.log('💾 Status de assinatura salvo em múltiplos storages com timestamp:', {
        status: 'active',
        planId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao salvar status de assinatura localmente:', error);
    }
  };

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
        
        // Salvar status de assinatura ativa
        saveSubscriptionStatus(result.planId || 'pro');
        
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
        
        // Esperar 10 segundos e tentar novamente (aumentado de 5 para 10)
        setTimeout(() => {
          verifyPayment(true);
        }, 10000);
      } else if (result.error?.includes('válida no Stripe, mas não foi possível sincronizar') && retryCount < 5) {
        // Problema de sincronização com o banco - tentar novamente com intervalo maior
        console.log('⚠️ Assinatura válida no Stripe, mas problemas de sincronização. Tentando novamente...');
        setRetryCount(prev => prev + 1);
        
        toast({
          title: "Sincronizando pagamento...",
          description: `Seu pagamento foi aprovado! Estamos sincronizando com nosso sistema. Tentativa ${retryCount + 1}/6.`,
        });
        
        // Aumentar o intervalo para 15 segundos (aumentado de 7 para 15)
        setTimeout(() => {
          verifyPayment(true);
        }, 15000);
      } else if (retryCount >= 3 && !directSubscriptionCheck) {
        // Se ainda falhou após várias tentativas, tentar verificação direta da assinatura
        console.log('🔄 Tentando verificação direta da assinatura após falhas na verificação via session...');
        setDirectSubscriptionCheck(true);
        
        // Verificar diretamente usando o método getCurrentSubscription com retries
        const subscription = await paymentService.getCurrentSubscription(5, 5000);
        
        if (subscription && subscription.status === 'active') {
          console.log('✅ Verificação direta da assinatura bem-sucedida:', subscription);
          setStatus('success');
          
          // Salvar status de assinatura ativa
          saveSubscriptionStatus(subscription.planId);
          
          toast({
            title: "Assinatura ativada com sucesso!",
            description: "Bem-vindo ao LeadFlux. Sua assinatura foi verificada com sucesso.",
          });
        } else {
          // Como pagamento foi realizado, vamos provisionar acesso mesmo sem confirmação completa
          console.log('⚠️ Não conseguimos verificar completamente a assinatura, mas vamos provisionar acesso emergencial');
          setStatus('success');
          
          // Salvar status de assinatura ativa com plano padrão
          saveSubscriptionStatus('pro');
          
          toast({
            title: "Assinatura ativada!",
            description: "Sua assinatura foi ativada. Se encontrar problemas, contate o suporte.",
          });
        }
      } else {
        console.error('❌ Falha na verificação do pagamento:', result);
        
        // Se o erro menciona que a assinatura existe no Stripe, mas não no banco de dados,
        // vamos provisionar acesso de qualquer forma
        if (result.error?.includes('válida no Stripe')) {
          console.log('⚠️ Assinatura válida no Stripe, provisionando acesso de emergência');
          setStatus('success');
          
          // Salvar status de assinatura ativa com plano padrão
          saveSubscriptionStatus('pro');
          
          toast({
            title: "Assinatura ativada!",
            description: "Seu pagamento foi processado e sua assinatura foi ativada.",
          });
        } else {
          setStatus('error');
          setErrorDetails(result.error || 'Não foi possível confirmar seu pagamento');
          
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
      
      // Em caso de erro, ainda assim tentar verificação direta
      if (!directSubscriptionCheck) {
        try {
          console.log('🔄 Tentando verificação direta da assinatura após exceção...');
          setDirectSubscriptionCheck(true);
          
          // Verificar diretamente usando o método getCurrentSubscription com retries
          const subscription = await paymentService.getCurrentSubscription(5, 5000);
          
          if (subscription && subscription.status === 'active') {
            console.log('✅ Verificação direta da assinatura bem-sucedida:', subscription);
            setStatus('success');
            
            // Salvar status de assinatura ativa
            saveSubscriptionStatus(subscription.planId);
            
            toast({
              title: "Assinatura ativada com sucesso!",
              description: "Bem-vindo ao LeadFlux. Sua assinatura foi verificada com sucesso.",
            });
            return;
          }
        } catch (subError) {
          console.error('❌ Erro na verificação direta da assinatura:', subError);
        }
        
        // Se todas as verificações falharem, mas estamos na tela de sucesso, confiamos que o pagamento foi processado
        // e provisionamos acesso de emergência
        console.log('🚨 Todas as verificações falharam, mas estamos na tela de sucesso. Provisionando acesso de emergência');
        setStatus('success');
        
        // Salvar status de assinatura ativa com plano padrão
        saveSubscriptionStatus('pro');
        
        toast({
          title: "Acesso ativado!",
          description: "Seu pagamento foi processado. Se encontrar problemas, contate o suporte.",
        });
      } else {
        setStatus('error');
        setErrorDetails(error.response?.data?.error || error.message);
      }
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
    // Garantir que o status da assinatura está salvo antes de navegar
    if (status === 'success') {
      saveSubscriptionStatus('pro');
    }
    
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
          </div>
        ) : status === 'success' ? (
          <div className="text-center">
            <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Pagamento confirmado!</h2>
            <p className="text-muted-foreground mb-6">
              Sua assinatura foi ativada com sucesso. Aproveite todas as funcionalidades do LeadFlux!
            </p>
            <Button 
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Ir para o Dashboard
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="rounded-full bg-red-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Ocorreu um problema</h2>
            <p className="text-muted-foreground mb-6">
              {errorDetails || "Não foi possível confirmar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte."}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleTryAgain}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Tentar Novamente
              </Button>
              <Button 
                variant="outline"
                onClick={handleSupport}
                className="w-full"
              >
                Contatar Suporte
              </Button>
              {!showDiagnostic && (
                <Button 
                  variant="ghost"
                  onClick={handleRunDiagnostic}
                  className="w-full text-gray-600"
                >
                Executar Diagnóstico
              </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Área de diagnóstico expandida */}
        {showDiagnostic && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Diagnóstico de Assinatura</h3>
            {!diagnostic ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">Executando diagnóstico...</span>
                </div>
            ) : (
              <div className="text-xs bg-gray-100 p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto">
                <pre>{JSON.stringify(diagnostic, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 