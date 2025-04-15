import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Spinner } from '../../components/Spinner';
import ReactConfetti from 'react-confetti';
import axios from 'axios';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [planName, setPlanName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('ID da sessão não encontrado. Contate o suporte.');
      setLoading(false);
      return;
    }

    // Verificar a sessão de pagamento
    const verifyPayment = async () => {
      try {
        const response = await axios.get(`/api/payment/verify-session/${sessionId}`);
        
        if (response.data.success) {
          setSubscription(response.data.subscription);
          
          // Mapear planId para nome amigável
          const planMap: {[key: string]: string} = {
            'basic': 'Plano Básico',
            'pro': 'Plano Pro',
            'elite': 'Plano Elite',
            'scale': 'Plano Scale'
          };
          
          setPlanName(planMap[response.data.planId] || response.data.planId);
          setLoading(false);
          setShowConfetti(true);

          // Esconder confete após 5 segundos
          setTimeout(() => {
            setShowConfetti(false);
          }, 5000);
        } else {
          setError(response.data.error || 'Erro ao verificar pagamento.');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Erro ao verificar sessão:', err);
        setError(err.response?.data?.error || 'Erro ao processar pagamento. Tente novamente ou contate o suporte.');
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search]);

  // Formatar data
  const formatDate = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {!loading && !error && showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-500">Verificando pagamento...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Ops! Algo deu errado</h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <button 
                  onClick={() => navigate('/')} 
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Voltar para Home
                </button>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ir para o Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-gray-900">Pagamento confirmado com sucesso!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Parabéns! Sua assinatura do {planName} está ativa.
              </p>
              
              {subscription && (
                <div className="mt-4 bg-gray-50 rounded-md p-4 text-sm text-left">
                  <h4 className="font-medium text-gray-700 mb-2">Detalhes da assinatura:</h4>
                  <p className="text-gray-600">Status: <span className="font-medium text-green-600">Ativa</span></p>
                  <p className="text-gray-600">
                    Válida até: <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ir para o Dashboard
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  className="mt-3 w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Voltar para Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess; 