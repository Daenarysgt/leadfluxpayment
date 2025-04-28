import { Link } from 'react-router-dom';
import Icons from './icons';

const features = [
  {
    name: 'Quizz, VSL, Landing Pages',
    description: 'Crie páginas de alta conversão com nosso editor intuitivo.',
    icon: Icons.ChartIcon
  },
  {
    name: 'Criação de Funis Interativos',
    description: 'Construa jornadas dinâmicas para envolver e converter seus visitantes',
    icon: Icons.AutomationIcon
  },
  {
    name: 'Trackeamento com Meta Ads',
    description: 'Acompanhe o desempenho dos seus funis com integração oficial ao Meta Ads.',
    icon: Icons.IntegrationIcon
  },
  {
    name: 'Analytics Avançado',
    description: 'Acompanhe métricas importantes e tome decisões baseadas em dados.',
    icon: Icons.AnalyticsIcon
  },
  {
    name: 'Suporte Premium',
    description: 'Conte com nossa equipe especializada para ajudar em todas as etapas.',
    icon: Icons.SupportIcon
  },
  {
    name: 'Segurança de Dados',
    description: 'Seus dados estão protegidos com as mais avançadas tecnologias de segurança.',
    icon: Icons.SecurityIcon
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Ferramentas para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              converter mais
            </span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Tudo que você precisa para transformar visitantes em leads qualificados
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative p-6 bg-white rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Começar Gratuitamente
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
} 