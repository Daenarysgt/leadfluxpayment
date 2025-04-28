import { Link } from 'react-router-dom';
import DashboardImage from '../../assets/leadsflux.png';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50 opacity-70"></div>
      
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Funil interativo{' '}
              <br className="hidden lg:block" />
              que transforma{' '}
              <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                tráfego em vendas!
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Transforme visitantes em clientes com nossa plataforma intuitiva de criação de funis. 
              Acompanhe métricas em tempo real e tome decisões baseadas em dados.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#pricing"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" 
                  />
                </svg>
                Ver Planos
              </a>
              <a
                href="https://www.leadflux.digital/f/funil-leadflux"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white text-base px-6 py-3 rounded-lg transition-all duration-200 hover:bg-gray-800"
              >
                Ver Demo
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
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
                        className="w-4 h-4 text-yellow-400"
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
          <div className="relative w-full">
            <div className="relative">
              {/* Background decorative elements */}
              <div className="absolute -top-12 -right-12 w-72 h-72 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-gradient-to-br from-purple-200 to-purple-100 rounded-full filter blur-2xl opacity-70 animate-pulse delay-150"></div>
              
              {/* Dashboard Image */}
              <div className="relative rounded-xl shadow-xl overflow-hidden">
                <img 
                  src={DashboardImage}
                  alt="LeadFlux Dashboard" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 