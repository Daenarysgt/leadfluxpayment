import { useEffect, useState } from 'react';

const stats = [
  {
    value: '10k+',
    label: 'Leads Capturados',
    description: 'Clientes satisfeitos que confiam na nossa plataforma',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-600'
  },
  {
    value: '95%',
    label: 'Taxa de Conversão',
    description: 'Funis otimizados com alta taxa de conversão de visitantes em vendas',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-green-100 text-green-600'
  },
  {
    value: '24/7',
    label: 'Suporte Dedicado',
    description: 'Nossa equipe está disponível todos os dias da semana',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'bg-purple-100 text-purple-600'
  },
  {
    value: '99.9%',
    label: 'Uptime Garantido',
    description: 'Plataforma estável e sempre disponível para você',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'bg-yellow-100 text-yellow-600'
  }
];

export default function Stats() {
  const [animatedStats, setAnimatedStats] = useState({
    leads: 0,
    conversao: 0,
    clientes: 0,
    satisfacao: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        leads: 50000,
        conversao: 27,
        clientes: 1200,
        satisfacao: 98
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="stats" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Números que impulsionam 
            <span className="text-blue-600"> seu sucesso</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Resultados reais de clientes que transformaram seus negócios com nossa plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              
              <h3 className="mt-5 text-4xl font-bold text-gray-900">
                {stat.value}
              </h3>
              
              <div className="mt-2">
                <p className="text-lg font-medium text-gray-900">{stat.label}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gray-50 rounded-2xl p-8 md:p-12">
          <div className="md:flex items-center justify-between">
            <div className="md:max-w-lg">
              <h3 className="text-2xl font-bold text-gray-900">
                Pronto para aumentar suas conversões?
              </h3>
              <p className="mt-3 text-lg text-gray-600">
                Comece a usar o LeadFlux hoje mesmo e veja resultados em poucos dias.
              </p>
            </div>
            
            <div className="mt-6 md:mt-0">
              <a
                href="#pricing"
                className="inline-flex items-center px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Ver Planos
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 