import { Link } from 'react-router-dom';
import Icons from './icons';

const features = [
  {
    name: 'Quizz, VSL, Landing Pages',
    description: 'Crie páginas de alta conversão com nosso editor intuitivo.',
    icon: Icons.ChartIcon,
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Funis Interativos',
    description: 'Construa jornadas dinâmicas que se adaptam ao comportamento do usuário.',
    icon: Icons.AutomationIcon,
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Integração com Meta Ads',
    description: 'Acompanhe campanhas e otimize ROAS com rastreamento avançado.',
    icon: Icons.IntegrationIcon,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    name: 'Analytics em Tempo Real',
    description: 'Visualize dados e métricas importantes para decisões estratégicas.',
    icon: Icons.AnalyticsIcon,
    color: 'from-orange-500 to-orange-600'
  },
  {
    name: 'Suporte Premium',
    description: 'Acesso direto à nossa equipe especializada para ajudar em todas as etapas.',
    icon: Icons.SupportIcon,
    color: 'from-green-500 to-green-600'
  },
  {
    name: 'Segurança de Dados',
    description: 'Proteção avançada com criptografia e conformidade com regulamentações.',
    icon: Icons.SecurityIcon,
    color: 'from-red-500 to-red-600'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ferramentas potentes para 
            <span className="text-blue-600"> maximizar conversões</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Tudo que você precisa para transformar visitantes em clientes satisfeitos
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="group relative p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Background gradient that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6`}>
                <feature.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {feature.name}
              </h3>
              
              <p className="mt-3 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Ver Planos
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