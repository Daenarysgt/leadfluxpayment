import { Link } from 'react-router-dom';
import { useState } from 'react';

const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const plans = [
  {
    name: 'leadflux BASIC',
    monthlyPrice: 'R$99',
    annualPrice: 'R$989,40',
    oldAnnualPrice: 'R$1164,00',
    description: 'Perfeito para começar tranquilo e atingir seus objetivos gradualmente.',
    features: [
      'Até 2 funis',
      'Até 5 mil leads na conta',
      'Componentes interativos',
      'Domínio próprio',
      'Pixel e Scripts de trackeamento',
      'Gestão e downloads dos leads'
    ],
    cta: 'Selecionar',
    color: 'white',
    popular: false
  },
  {
    name: 'leadflux PRO',
    monthlyPrice: 'R$199',
    annualPrice: 'R$2009,40',
    oldAnnualPrice: 'R$2364,00',
    description: 'Para quem já tem experiência de mercado e testes de performance.',
    features: [
      'Até 5 funis',
      'Até 10 mil leads na conta',
      'Componentes interativos',
      'Webhook',
      'Domínio próprio',
      'Pixel e Scripts de trackeamento',
      'Gestão e downloads dos leads'
    ],
    cta: 'Selecionar',
    color: 'gradient',
    popular: true
  },
  {
    name: 'leadflux ELITE',
    monthlyPrice: 'R$299',
    annualPrice: 'R$3029,40',
    oldAnnualPrice: 'R$3564,00',
    description: 'Feito para quem precisa de escala e possui demanda de terceiros.',
    features: [
      'Até 10 funis',
      'Até 25 mil leads na conta',
      'Componentes interativos',
      'Webhook',
      'Domínio próprio',
      'Pixel e Scripts de trackeamento',
      'Gestão e downloads dos leads',
      'Compartilhamento de funis',
      'Edição compartilhada'
    ],
    cta: 'Selecionar',
    color: 'white',
    popular: false
  },
  {
    name: 'leadflux SCALE',
    monthlyPrice: 'R$499',
    annualPrice: 'R$5069,40',
    oldAnnualPrice: 'R$5964,00',
    description: 'Perfeito para líderes do mercado que buscam inovação constante.',
    features: [
      'Até 25 funis',
      'Até 100 mil leads na conta',
      'Componentes interativos',
      'Webhook',
      'Domínio próprio',
      'Pixel e Scripts de trackeamento',
      'Gestão e downloads dos leads',
      'Suporte com video chamadas',
      'Compartilhamento de funis',
      'Edição compartilhada'
    ],
    cta: 'Selecionar',
    color: 'white',
    popular: false
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Planos
          </h2>

          {/* Billing Switch */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-l-lg ${
                isAnnual 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Anual <span className="text-blue-400 ml-1">-15%</span>
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-r-lg ${
                !isAnnual 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Mensal
            </button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col h-full ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 ring-4 ring-purple-600 ring-opacity-20'
                  : 'bg-white'
              }`}
            >
              <div>
                <h3 className={`text-2xl font-semibold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                  {plan.popular && (
                    <span className="ml-2 inline-block px-3 py-1 text-sm bg-black rounded-full text-white">
                      destaque
                    </span>
                  )}
                </h3>
                <p className={`mt-4 text-sm ${plan.popular ? 'text-gray-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                
                {isAnnual && (
                  <p className={`mt-4 text-sm line-through ${plan.popular ? 'text-gray-200' : 'text-gray-400'}`}>
                    R$ {plan.oldAnnualPrice}
                  </p>
                )}
                
                <p className={`mt-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-4xl font-bold">
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-base font-medium">/{isAnnual ? 'ano' : 'mês'}</span>
                </p>
              </div>

              <ul className="mt-10 space-y-4 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${
                      plan.popular 
                        ? 'text-white' 
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                    }`}>
                      <CheckIcon />
                    </div>
                    <p className={`text-base ${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                      {feature}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link
                  to="/register"
                  className={`block w-full py-3 px-6 text-center rounded-lg text-base font-medium transition-all duration-200 ${
                    plan.popular
                      ? 'bg-black text-white hover:bg-gray-900'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 