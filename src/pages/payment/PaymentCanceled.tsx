import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCanceled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Pagamento cancelado</h2>
        <p className="text-muted-foreground mb-6">
          Você cancelou o processo de pagamento. Se precisar de ajuda ou tiver alguma dúvida, entre em contato com nosso suporte.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate('/pricing')} className="w-full">
            Tentar novamente
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            Voltar para Home
          </Button>
        </div>
      </div>
    </div>
  );
} 