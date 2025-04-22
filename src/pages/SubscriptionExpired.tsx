import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionExpired: React.FC = () => {
  const navigate = useNavigate();

  const handleRenewSubscription = () => {
    navigate('/pricing');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Assinatura Expirada</h1>
          <div className="mt-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg text-gray-600">
            Sua assinatura foi cancelada ou expirou.
          </p>
          <p className="mt-2 text-gray-600">
            Para continuar usando todas as funcionalidades do LeadFlux, você precisa renovar sua assinatura.
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleRenewSubscription}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Renovar Assinatura
          </button>
          <button
            onClick={() => navigate('/account')}
            className="mt-4 w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ir para Minha Conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpired; 