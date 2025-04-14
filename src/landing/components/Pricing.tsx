import { Link } from 'react-router-dom';
import Icons from './icons';
import { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 'R$97',
    annualPrice: 'R$970',
    description: 'Perfeito para começar a capturar leads',
    features: [
      'Até 1.000 leads por mês',
      'Páginas de captura ilimitadas',
      'Integrações básicas',
      'Suporte por email'
    ],
    cta: 'Começar agora',
    color: 'white',
    popular: false
  },
  {
    name: 'Professional',
    monthlyPrice: 'R$197',
    annualPrice: 'R$1.970',
    description: 'Para times que precisam de mais poder',
    features: [
      'Até 10.000 leads por mês',
      'Páginas de captura ilimitadas',
      'Todas as integrações',
      'Suporte prioritário',
      'Automações avançadas',
      'Relatórios personalizados'
    ],
    cta: 'Começar agora',
    color: 'gradient',
    popular: true
  },
  {
    name: 'Elite',
    monthlyPrice: 'R$297',
    annualPrice: 'R$2.970',
    description: 'Para empresas em crescimento',
    features: [
      'Até 50.000 leads por mês',
      'Todas as features do Professional',
      'API dedicada',
      'Suporte prioritário 24/5',
      'Setup assistido',
      'Treinamento da equipe'
    ],
    cta: 'Começar agora',
    color: 'white',
    popular: false
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'R$497',
    annualPrice: 'R$4.970',
    description: 'Soluções customizadas para grandes empresas',
    features: [
      'Leads ilimitados',
      'Todas as features do Elite',
      'API dedicada',
      'Suporte 24/7',
      'Setup assistido premium',
      'SLA garantido'
    ],
    cta: 'Falar com vendas',
    color: 'white',
    popular: false
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Planos para todos os{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              tamanhos
            </span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Escolha o plano ideal para o seu negócio
          </p>

          {/* Billing Switch */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm ${!isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>Mensal</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAnnual ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              Anual
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Economize 20%
              </span>
            </span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 ring-4 ring-purple-600 ring-opacity-20'
                  : 'bg-white'
              }`}
            >
              <h3 className={`text-2xl font-semibold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
                {plan.popular && (
                  <span className="ml-2 inline-block px-3 py-1 text-sm bg-white bg-opacity-20 rounded-full text-white">
                    Mais Popular
                  </span>
                )}
              </h3>
              <p className={`mt-4 text-sm ${plan.popular ? 'text-gray-100' : 'text-gray-500'}`}>
                {plan.description}
              </p>
              <p className={`mt-8 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                <span className="text-4xl font-bold">{isAnnual ? plan.annualPrice : plan.monthlyPrice}</span>
                <span className="text-base font-medium">/{isAnnual ? 'ano' : 'mês'}</span>
              </p>

              <ul className="mt-10 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className={`flex-shrink-0 ${
                      plan.popular 
                        ? 'text-white' 
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'
                    }`}>
                      <Icons.CheckIcon className="h-6 w-6" />
                    </div>
                    <p className={`ml-3 text-base ${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                      {feature}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link
                  to="/register"
                  className={`block w-full py-3 px-6 text-center rounded-lg text-base font-medium transition-all duration-200 ${
                    plan.color === 'gradient'
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 bg-white hover:bg-gray-50'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/faq"
            className="text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Dúvidas frequentes sobre nossos planos →
          </Link>
        </div>
      </div>
    </section>
  );
} 