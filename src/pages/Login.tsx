import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center">
          <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            LeadFlux
          </span>
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Bem-vindo de volta! Entre com sua conta para continuar.
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
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/recuperar-senha" className="text-purple-600 hover:text-purple-700">
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Entrar
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OU CONTINUE COM</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M12.545,12.151L12.545,12.151c0,1.054,0.947,1.91,2.012,1.91h2.969c1.654,0,3-1.346,3-3v-1.098c0-0.612-0.497-1.109-1.109-1.109h-3.86c-1.066,0-1.912,0.856-1.912,1.912v1.098C13.545,11.295,13.045,11.795,12.545,12.151z M15.545,8.854h3.859c0.612,0,1.109,0.497,1.109,1.109v1.098c0,1.654-1.346,3-3,3h-2.969c-1.065,0-1.912-0.856-1.912-1.912v-1.098c0-0.612,0.497-1.109,1.109-1.109H15.545z M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M12,20c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S16.418,20,12,20z"
                    fill="currentColor"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M12,2A10,10,0,0,0,2,12a9.89,9.89,0,0,0,6.81,9.41A.5.5,0,0,0,9,21c0-.07,0-.09,0-.17V19.3c-2.79.61-3.39-1.34-3.39-1.34A2.67,2.67,0,0,0,4.5,16.37c-.91-.62.07-.61.07-.61a2.11,2.11,0,0,1,1.54,1,2.14,2.14,0,0,0,2.91.83,2.12,2.12,0,0,1,.63-1.34C7.14,15.89,5,15.47,5,12.19A3.88,3.88,0,0,1,6,9.58a3.6,3.6,0,0,1,.1-2.65s.84-.27,2.75,1a9.51,9.51,0,0,1,5,0c1.91-1.29,2.75-1,2.75-1a3.6,3.6,0,0,1,.1,2.65,3.88,3.88,0,0,1,1,2.61c0,3.29-2.14,3.7-4.18,3.89a2.38,2.38,0,0,1,.68,1.85v2.63c0,.08,0,.1,0,.17a.5.5,0,0,0,.19.38A9.89,9.89,0,0,0,22,12,10,10,0,0,0,12,2Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700">
                Registre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 