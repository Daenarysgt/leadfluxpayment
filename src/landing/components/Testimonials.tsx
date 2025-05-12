import { useState } from 'react';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Carlos Silva",
      role: "CEO, TechStart",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      content: "O LeadFlux transformou completamente nossa estratégia de captação de leads. Em apenas 3 meses, aumentamos nossas conversões em 150% e melhoramos nosso ROI significativamente.",
      rating: 5,
      bgColor: "bg-blue-50"
    },
    {
      name: "Ana Martins",
      role: "Marketing Director, EduTech",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      content: "A facilidade de criar funis personalizados e a integração com outras ferramentas fizeram toda a diferença em nossas campanhas. Simples de usar e extremamente eficaz.",
      rating: 5,
      bgColor: "bg-purple-50"
    },
    {
      name: "Roberto Santos",
      role: "Founder, GrowthLab",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      content: "O suporte é excepcional e as features de automação nos ajudaram a escalar nossas operações sem aumentar a equipe. Um investimento que valeu cada centavo.",
      rating: 5,
      bgColor: "bg-green-50"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const companiesLogos = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1280px-Netflix_2015_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png"
  ];

  return (
    <section id="testimonials" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Depoimentos de clientes
            <span className="text-blue-600"> satisfeitos</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Veja o que nossos clientes têm a dizer sobre seus resultados com o LeadFlux
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Testimonials Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`rounded-xl p-8 transition-all duration-300 ${testimonial.bgColor} hover:shadow-lg`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {/* Rating Stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
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

                {/* Testimonial Content */}
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* User Info */}
                <div className="flex items-center mt-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-sm"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
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
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-20">
          <p className="text-center text-sm font-medium text-gray-700 uppercase tracking-wider mb-8">
            Empresas que confiam no LeadFlux
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {companiesLogos.map((logo, index) => (
              <div key={index} className="h-8 grayscale opacity-70 hover:opacity-100 transition-opacity duration-300">
                <img src={logo} alt="Company logo" className="h-full w-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 