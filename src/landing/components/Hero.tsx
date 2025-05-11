import { Link } from 'react-router-dom';
import DashboardImage from '../../assets/leadsflux.png';

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="lg:col-span-5 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              A plataforma 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 block mt-2">
                para converter tráfego em vendas
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Um funil interativo, intuitivo e completo para criar, gerenciar e otimizar seus leads em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
            
            {/* Trust Indicators */}
            <div className="mt-12 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-4 gap-x-8">
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
          </div>

          {/* Right Column - Dashboard Image */}
          <div className="lg:col-span-7 relative">
            <div className="relative">
              {/* Card-like container for dashboard image */}
              <div className="rounded-2xl shadow-2xl overflow-hidden bg-white p-2 transform lg:translate-x-5 lg:translate-y-5">
                {/* Dashboard Image */}
                <div className="rounded-xl overflow-hidden shadow-inner">
                  <img 
                    src={DashboardImage}
                    alt="LeadFlux Dashboard" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-100 rounded-lg transform rotate-12 hidden lg:block"></div>
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-purple-100 rounded-full hidden lg:block"></div>
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-yellow-100 rounded-full transform -translate-y-1/2 hidden lg:block"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 