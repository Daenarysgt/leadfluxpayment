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
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        setVerifying(false);
        return;
      }

      try {
        const result = await paymentService.verifyPaymentStatus(sessionId);
        
        if (result.success) {
          setStatus('success');
          toast({
            title: "Assinatura ativada com sucesso!",
            description: "Bem-vindo ao LeadFlux. Você já pode começar a usar todas as funcionalidades.",
          });
        } else {
          setStatus('error');
          toast({
            title: "Erro na verificação",
            description: "Não foi possível confirmar seu pagamento. Entre em contato com o suporte.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        setStatus('error');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleTryAgain = () => {
    navigate('/pricing');
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
            <p className="text-muted-foreground mb-6">
              Não foi possível confirmar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.
            </p>
            <Button onClick={handleTryAgain} variant="outline" className="w-full">
              Voltar para Planos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 