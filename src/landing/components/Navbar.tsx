import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Links de navegação com as seções da landing page
  const navLinks = [
    { name: 'Recursos', href: '#features' },
    { name: 'Estatísticas', href: '#stats' },
    { name: 'Depoimentos', href: '#testimonials' },
    { name: 'Preços', href: '#pricing' },
    { name: 'Perguntas', href: '#faq' },
  ];

  // Estilo comum para todos os blocos da navbar
  const blockStyle = "bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 h-12";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-3">
      <div className="max-w-[800px] mx-auto px-8">
        <div className="flex items-center justify-center gap-3">
          {/* Bloco 1: Logo com divisória e descrição */}
          <div className={blockStyle + " flex-shrink-0"}>
            <Link to="/" className="flex items-center h-full px-2">
              <div className="flex items-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 text-lg font-bold">
                  LeadFlux
                </span>
                <div className="mx-2 h-5 w-px bg-gray-200"></div>
                <span className="text-gray-600 text-xs font-medium whitespace-nowrap">
                  <span className="block leading-tight">A plataforma completa</span>
                  <span className="block leading-tight">para seu trabalho.</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Bloco 2: Navegação Principal - Visível apenas em telas maiores */}
          <nav className="hidden lg:block flex-1">
            <div className={blockStyle + " px-1"}>
              <ul className="flex items-center justify-center h-full">
                {navLinks.map((link, index) => (
                  <li key={index} className="relative mx-1">
                    <a 
                      href={link.href} 
                      className="py-1 px-1.5 text-gray-700 hover:text-blue-600 font-medium text-sm flex items-center h-full"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Bloco 3: Contact Sales */}
            <div className="hidden md:block">
              <div className={blockStyle + " w-[130px]"}>
                <a 
                  href="#contact" 
                  className="flex items-center justify-center h-full px-2 text-gray-700 hover:text-blue-600 font-medium text-sm whitespace-nowrap"
                >
                  Fale Conosco
                </a>
              </div>
            </div>

            {/* Bloco 4: Login/Signup - ajuste para conter botão */}
            <div className={blockStyle + " flex items-center w-[180px]"}>
              <div className="flex items-center justify-center w-[80px] h-full border-r border-gray-100">
                <a 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm"
                >
                  Entrar
                </a>
              </div>
              <div className="flex items-center justify-center w-[100px] h-full">
                <a 
                  href="/register" 
                  className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 hover:shadow-md whitespace-nowrap"
                >
                  Cadastre-se
                </a>
              </div>
            </div>
          </div>

          {/* Botão Mobile Menu */}
          <button 
            className="lg:hidden bg-white p-2 rounded-xl shadow-sm border border-gray-100 h-12 w-12 flex items-center justify-center flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="lg:hidden mt-2 bg-white rounded-2xl shadow-lg p-4 mx-auto max-w-sm border border-gray-100">
          <ul className="space-y-3">
            {navLinks.map((link, index) => (
              <li key={index}>
                <a 
                  href={link.href}
                  className="block py-2 px-3 text-gray-700 hover:text-blue-600 font-medium text-sm"
                >
                  {link.name}
                </a>
              </li>
            ))}
            <li className="md:hidden">
              <a 
                href="#contact" 
                className="block py-2 px-3 text-gray-700 hover:text-blue-600 font-medium text-sm"
              >
                Fale Conosco
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar; 