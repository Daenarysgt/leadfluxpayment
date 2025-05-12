import { Link } from 'react-router-dom';
import DashboardImage from '../../assets/leadsflux.png';
import { useEffect } from 'react';

export default function Hero() {
  // CSS para a animação do gradiente
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes textGradient {
        0% {
          color: #2563eb;
        }
        50% {
          color: #7c3aed;
        }
        100% {
          color: #2563eb;
        }
      }
      
      .animated-text {
        animation: textGradient 5s ease infinite;
        position: relative;
        z-index: 30;
        display: block;
        font-weight: 800;
        line-height: 1.1;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 z-0"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 z-0"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content - Centered */}
        <div className="text-center max-w-4xl mx-auto relative z-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="animated-text py-1">
              Seduza. Converta. Venda.
            </span>
            <span className="block mt-1 text-gray-900">
              A plataforma de criação de funis interativos
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Arraste, edite e publique — simples assim. Explore um funil em ação e veja como tudo funciona.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-base font-medium px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:opacity-90"
            >
              Começar Agora
            </a>
            <a
              href="https://www.leadflux.digital/f/funil-leadflux"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-base font-medium px-8 py-4 rounded-full transition-all duration-200"
            >
              Explorar Funil
            </a>
          </div>
          
          {/* Indicadores de confiança */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8">
            <div className="flex items-center mt-2">
              <div className="flex -space-x-2 mr-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://randomuser.me/api/portraits/men/${i}.jpg`}
                    alt="User"
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                +1000 profissionais já utilizam
              </p>
            </div>
            
            <div className="flex items-center mt-2">
              <div className="flex items-center mr-2">
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
              <p className="text-sm text-gray-600 font-medium">
                4.9/5 de satisfação
              </p>
            </div>
          </div>
        </div>
        
        {/* Main content container with positioning context */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          {/* Efeito de brilho/resplandor abaixo/rodapé da imagem */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-100/30 to-transparent rounded-b-xl z-0"></div>
          
          {/* Container com efeito glassmorphism */}
          <div className="relative z-10 p-6 sm:p-8 rounded-[20px] overflow-hidden" 
               style={{
                 background: 'rgba(255, 255, 255, 0.05)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255, 255, 255, 0.1)',
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
               }}>
            {/* Dashboard Image */}
            <div className="rounded-xl overflow-hidden bg-white shadow-lg">
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
        </div>
      </div>
    </section>
  );
} 