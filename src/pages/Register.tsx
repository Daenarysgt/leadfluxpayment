import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export default function Register() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            LeadFlux
          </span>
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Crie sua conta e comece a construir funis incríveis.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:px-10">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-4 border p-4 rounded-md bg-blue-50/30">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                className="mt-0.5 h-5 w-5 border-gray-300 bg-white ring-1 ring-gray-300"
              />
              <label 
                htmlFor="terms" 
                className="text-sm cursor-pointer"
              >
                Ao se cadastrar você reconhece que leu, entendeu e concorda com os{' '}
                <Link to="/termos" className="text-blue-600 font-medium hover:underline">
                  Termos e Condições de Uso
                </Link>{' '}
                da plataforma.
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={!agreedToTerms}
                className={`w-full flex justify-center py-2 px-4 rounded-lg text-white ${
                  agreedToTerms 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {agreedToTerms ? 'Criar Conta' : 'Aceite os termos para continuar'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700">
                Faça login
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              Ao criar uma conta, você concorda com nossos{' '}
              <Link to="/termos" className="text-purple-600 hover:text-purple-700">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link to="/privacidade" className="text-purple-600 hover:text-purple-700">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 