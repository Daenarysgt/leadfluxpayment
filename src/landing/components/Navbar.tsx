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
        ? 'bg-white shadow-md py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">LeadFlux</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/recursos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Recursos
            </Link>
            <Link to="/precos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Preços
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              FAQ
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-white font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Começar Agora
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-900 focus:outline-none"
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
          <div className="md:hidden py-5 mt-3 bg-white rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4 px-4">
              <Link to="/recursos" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100">
                Recursos
              </Link>
              <Link to="/precos" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100">
                Preços
              </Link>
              <Link to="/faq" className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-100">
                FAQ
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2.5 my-2 rounded-full text-white font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 