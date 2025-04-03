import { useState } from 'react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Carlos Silva",
      role: "CEO, TechStart",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      content: "O LeadFlux transformou completamente nossa estratégia de captação de leads. Em apenas 3 meses, aumentamos nossas conversões em 150%.",
      company_logo: "/logos/techstart.png"
    },
    {
      name: "Ana Martins",
      role: "Marketing Director, EduTech",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      content: "A facilidade de criar funis personalizados e a integração com outras ferramentas fizeram toda a diferença em nossas campanhas.",
      company_logo: "/logos/edutech.png"
    },
    {
      name: "Roberto Santos",
      role: "Founder, GrowthLab",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      content: "O suporte é excepcional e as features de automação nos ajudaram a escalar nossas operações sem aumentar a equipe.",
      company_logo: "/logos/growthlab.png"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            O que Nossos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Clientes
            </span>{' '}
            Dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Histórias reais de empresas que transformaram seus resultados com o LeadFlux
          </p>
        </div>

        <div className="relative">
          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg transform transition-all duration-300 hover:-translate-y-2 ${
                  index === activeIndex ? 'ring-2 ring-blue-500' : ''
                }`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <blockquote className="text-gray-700 mb-6">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center justify-between">
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
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16">
          <p className="text-center text-gray-600 mb-8">Empresas que confiam no LeadFlux</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {/* Aqui você pode adicionar os logos das empresas */}
            <div className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300">
              {/* Placeholder para logo */}
              <div className="w-32 h-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300">
              <div className="w-32 h-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300">
              <div className="w-32 h-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300">
              <div className="w-32 h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 