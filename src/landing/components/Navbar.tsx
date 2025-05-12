import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Links de navegação com possíveis dropdowns
  const navLinks = [
    { 
      name: 'Produto', 
      dropdown: true,
      items: ['Funis', 'Leads', 'Analytics', 'Automações']
    },
    { 
      name: 'Soluções', 
      dropdown: true,
      items: ['Marketing', 'Vendas', 'Agências', 'E-commerce']
    },
    { 
      name: 'Recursos', 
      dropdown: true,
      items: ['Blog', 'Tutoriais', 'Webinars', 'Documentação']
    },
    { name: 'Preços', dropdown: false },
    { name: 'Empresa', dropdown: false },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-3 px-4 md:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 md:gap-4">
        {/* Bloco 1: Logo */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-2 border border-gray-100">
          <Link to="/" className="flex items-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 text-xl font-bold px-2">
              LeadFlux
            </span>
          </Link>
        </div>

        {/* Bloco 2: Navegação Principal - Visível apenas em telas maiores */}
        <nav className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] px-4 border border-gray-100">
            <ul className="flex items-center justify-center h-12">
              {navLinks.map((link, index) => (
                <li key={index} className="relative group mx-2">
                  <button 
                    className="py-2 px-3 text-gray-700 hover:text-blue-600 font-medium text-sm flex items-center"
                    onClick={() => link.dropdown && setIsOpen(!isOpen)}
                  >
                    {link.name}
                    {link.dropdown && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    )}
                  </button>
                  
                  {link.dropdown && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                      {link.items.map((item, idx) => (
                        <a 
                          key={idx} 
                          href="#" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Bloco 3: Contact Sales */}
        <div className="hidden md:block">
          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100">
            <a 
              href="#contact" 
              className="text-gray-700 hover:text-blue-600 font-medium text-sm py-3 px-5 block"
            >
              Fale Conosco
            </a>
          </div>
        </div>

        {/* Bloco 4: Login/Signup */}
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] p-1.5 border border-gray-100">
          <a 
            href="/login" 
            className="text-gray-700 hover:text-blue-600 font-medium text-sm py-2 px-3"
          >
            Entrar
          </a>
          <a 
            href="/signup" 
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium text-sm py-2 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            Cadastre-se
          </a>
        </div>

        {/* Botão Mobile Menu */}
        <button 
          className="lg:hidden bg-white p-2 rounded-xl shadow-sm border border-gray-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="lg:hidden mt-2 bg-white rounded-2xl shadow-lg p-4 mx-auto max-w-sm border border-gray-100">
          <ul className="space-y-3">
            {navLinks.map((link, index) => (
              <li key={index}>
                <button 
                  className="flex justify-between items-center w-full py-2 px-3 text-gray-700 hover:text-blue-600 font-medium text-sm"
                  onClick={() => link.dropdown && setIsOpen(!isOpen)}
                >
                  {link.name}
                  {link.dropdown && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  )}
                </button>
                
                {link.dropdown && (
                  <div className="pl-4 mt-2 space-y-2">
                    {link.items.map((item, idx) => (
                      <a 
                        key={idx} 
                        href="#" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                )}
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