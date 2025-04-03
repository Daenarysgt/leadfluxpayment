import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">LeadFlux</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/recursos" className="text-gray-600 hover:text-gray-900">
              Recursos
            </Link>
            <Link to="/precos" className="text-gray-600 hover:text-gray-900">
              Preços
            </Link>
            <Link to="/faq" className="text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
} 