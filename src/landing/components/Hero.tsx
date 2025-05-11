import { Link } from 'react-router-dom';
import DashboardImage from '../../assets/leadsflux.png';

export default function Hero() {
  // Array com os elementos da sidebar/funcionalidades do LeadFlux
  const workspaceFeatures = [
    { name: 'Funis', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', bgColor: 'bg-blue-100' },
    { name: 'Leads', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', bgColor: 'bg-purple-100' },
    { name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', bgColor: 'bg-green-100' },
    { name: 'Automações', icon: 'M13 10V3L4 14h7v7l9-11h-7z', bgColor: 'bg-yellow-100' },
    { name: 'Integrações', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z', bgColor: 'bg-red-100' },
    { name: 'Templates', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z', bgColor: 'bg-indigo-100' },
    { name: 'Relatórios', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bgColor: 'bg-cyan-100' },
    { name: 'Equipe', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', bgColor: 'bg-pink-100' },
    { name: 'Configurações', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', bgColor: 'bg-orange-100' },
  ];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content - Centered */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            <span className="block">A plataforma completa</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 block mt-2">
              para converter tráfego em vendas
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Um funil interativo, intuitivo e completo para criar, gerenciar e otimizar 
            seus leads em tempo real.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Começar Agora
            </a>
            <a
              href="https://www.leadflux.digital/f/funil-leadflux"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-base font-medium px-8 py-4 rounded-full transition-all duration-200"
            >
              Ver Demo
            </a>
          </div>
          
          {/* Additional text */}
          <p className="mt-5 text-sm text-gray-500">
            Gratuito para sempre. Sem necessidade de cartão de crédito.
          </p>
        </div>
        
        {/* Main content container with positioning context */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          {/* Efeito de brilho/resplandor abaixo/rodapé da imagem */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-100/30 to-transparent rounded-b-xl z-0"></div>
          
          {/* Dashboard Image */}
          <div className="relative z-10 rounded-2xl shadow-xl overflow-hidden bg-white p-3 transform scale-95 origin-center">
            <div className="rounded-xl overflow-hidden shadow-inner">
              <img 
                src={DashboardImage}
                alt="LeadFlux Dashboard" 
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-100 rounded-lg transform rotate-12 hidden lg:block z-0"></div>
          <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-purple-100 rounded-full hidden lg:block z-0"></div>
          
          {/* Workspace Features Section - Positioned as floating card on the right */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-6 w-[320px] bg-white rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.12),0_0_20px_rgba(100,100,255,0.08)] p-7 hidden lg:block z-20">
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">Configure seu Workspace</h2>
              <p className="mt-1 text-sm text-gray-600">Comece com o que você precisa</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-7">
              {workspaceFeatures.slice(0, 9).map((feature, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`${feature.bgColor} p-3 rounded-lg mb-2 flex items-center justify-center`}>
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{feature.name}</span>
                </div>
              ))}
            </div>
            
            {/* Adicional features para aumentar a altura do card */}
            <div className="mt-10 mb-6 space-y-4">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Acesso a todos templates</span>
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Suporte 24/7</span>
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Personalização completa</span>
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Integrações ilimitadas</span>
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <a 
                href="#pricing" 
                className="w-full inline-flex items-center justify-center px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium hover:shadow-lg transition-all duration-200"
              >
                Começar agora
              </a>
            </div>
          </div>
          
          {/* Mobile version of Workspace Features - Only visible on small screens */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6 lg:hidden">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Configure seu Workspace</h2>
              <p className="mt-1 text-sm text-gray-600">Comece com o que você precisa</p>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {workspaceFeatures.slice(0, 8).map((feature, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`${feature.bgColor} p-3 rounded-lg mb-2 flex items-center justify-center`}>
                    <svg
                      className="w-6 h-6 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{feature.name}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href="#pricing" 
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium hover:shadow-lg transition-all duration-200"
              >
                Começar agora
              </a>
            </div>
          </div>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-y-6 gap-x-12">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://randomuser.me/api/portraits/men/${i}.jpg`}
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                />
              ))}
            </div>
            <p className="ml-3 text-sm text-gray-600">
              +1000 profissionais já utilizam
            </p>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="ml-2 text-sm text-gray-600">
              4.9/5 de satisfação
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 