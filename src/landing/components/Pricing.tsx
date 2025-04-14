import { Link } from 'react-router-dom';
import Icons from './icons';
import { useState } from 'react';

// Ícones para as features
const FeatureIcons = {
  funis: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H20L16 10H8L4 4Z M6 10L12 20L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  leads: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7C13 9.20914 11.2091 11 9 11ZM20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  componentes: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 5H20M4 12H20M4 19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  webhook: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dominio: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12C21 16.9706 16.9706 21 12 21M21 12C21 7.02944 16.9706 3 12 3M21 12H3M12 21C7.02944 21 3 16.9706 3 12M12 21C12 21 16 16.4183 16 12C16 7.58172 12 3 12 3M3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  pixel: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gestao: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  compartilhamento: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49M21 5C21 6.65685 19.6569 8 18 8C16.3431 8 15 6.65685 15 5C15 3.34315 16.3431 2 18 2C19.6569 2 21 3.34315 21 5ZM9 12C9 13.6569 7.65685 15 6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12ZM21 19C21 20.6569 19.6569 22 18 22C16.3431 22 15 20.6569 15 19C15 17.3431 16.3431 16 18 16C19.6569 16 21 17.3431 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  suporte: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 10L19.553 7.724C19.7054 7.64784 19.8748 7.61188 20.0466 7.61954C20.2184 7.62719 20.3834 7.67821 20.5275 7.76773C20.6716 7.85725 20.7895 7.98232 20.8696 8.13161C20.9497 8.28091 20.9894 8.44943 20.985 8.62V15.38C20.9894 15.5506 20.9497 15.7191 20.8696 15.8684C20.7895 16.0177 20.6716 16.1427 20.5275 16.2323C20.3834 16.3218 20.2184 16.3728 20.0466 16.3805C19.8748 16.3881 19.7054 16.3522 19.553 16.276L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const plans = [
  {
    name: 'leadflux BASIC',
    monthlyPrice: 'R$99',
    annualPrice: 'R$989,40',
    oldAnnualPrice: 'R$1164,00',
    description: 'Perfeito para começar tranquilo e atingir seus objetivos gradualmente.',
    features: [
      { text: 'Até 2 funis', icon: 'funis' },
      { text: 'Até 5 mil leads na conta', icon: 'leads' },
      { text: 'Componentes interativos', icon: 'componentes' },
      { text: 'Domínio próprio', icon: 'dominio' },
      { text: 'Pixel e Scripts de trackeamento', icon: 'pixel' },
      { text: 'Gestão e downloads dos leads', icon: 'gestao' }
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
      { text: 'Até 5 funis', icon: 'funis' },
      { text: 'Até 10 mil leads na conta', icon: 'leads' },
      { text: 'Componentes interativos', icon: 'componentes' },
      { text: 'Webhook', icon: 'webhook' },
      { text: 'Domínio próprio', icon: 'dominio' },
      { text: 'Pixel e Scripts de trackeamento', icon: 'pixel' },
      { text: 'Gestão e downloads dos leads', icon: 'gestao' }
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
      { text: 'Até 10 funis', icon: 'funis' },
      { text: 'Até 25 mil leads na conta', icon: 'leads' },
      { text: 'Componentes interativos', icon: 'componentes' },
      { text: 'Webhook', icon: 'webhook' },
      { text: 'Domínio próprio', icon: 'dominio' },
      { text: 'Pixel e Scripts de trackeamento', icon: 'pixel' },
      { text: 'Gestão e downloads dos leads', icon: 'gestao' },
      { text: 'Compartilhamento de funis', icon: 'compartilhamento' },
      { text: 'Edição compartilhada', icon: 'compartilhamento' }
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
      { text: 'Até 25 funis', icon: 'funis' },
      { text: 'Até 100 mil leads na conta', icon: 'leads' },
      { text: 'Componentes interativos', icon: 'componentes' },
      { text: 'Webhook', icon: 'webhook' },
      { text: 'Domínio próprio', icon: 'dominio' },
      { text: 'Pixel e Scripts de trackeamento', icon: 'pixel' },
      { text: 'Gestão e downloads dos leads', icon: 'gestao' },
      { text: 'Suporte com video chamadas', icon: 'suporte' },
      { text: 'Compartilhamento de funis', icon: 'compartilhamento' },
      { text: 'Edição compartilhada', icon: 'compartilhamento' }
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
                  <li key={feature.text} className="flex items-start">
                    <div className={`flex-shrink-0 ${
                      plan.popular 
                        ? 'text-white' 
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                    }`}>
                      {FeatureIcons[feature.icon]?.()}
                    </div>
                    <p className={`ml-3 text-base ${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                      {feature.text}
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