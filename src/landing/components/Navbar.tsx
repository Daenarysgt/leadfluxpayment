import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-sm py-3' 
        : 'bg-white py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">LeadFlux</span>
                <span className="ml-2 text-xs text-gray-500 hidden sm:inline-block">
                  A plataforma para<br />converter em vendas.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center justify-center space-x-1">
            <div className="relative group">
              <button className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center transition-colors duration-200">
                <span>Produto</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <div className="relative group">
              <button className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center transition-colors duration-200">
                <span>Soluções</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <div className="relative group">
              <button className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium flex items-center transition-colors duration-200">
                <span>Recursos</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <Link to="/precos" className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Preços
            </Link>
            
            <Link to="/empresa" className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Empresa
            </Link>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/contato" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg">
              Fale Conosco
            </Link>
            
            <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg">
              Entrar
            </Link>
            
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Criar Conta
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-gray-900 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 mt-3 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col space-y-2 px-4">
              <button className="text-left text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100 flex justify-between items-center">
                Produto
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <button className="text-left text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100 flex justify-between items-center">
                Soluções
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <button className="text-left text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100 flex justify-between items-center">
                Recursos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <Link to="/precos" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100">
                Preços
              </Link>
              
              <Link to="/empresa" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100">
                Empresa
              </Link>
              
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/contato" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                  Fale Conosco
                </Link>
                
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                  Entrar
                </Link>
                
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2.5 my-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  Criar Conta
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 