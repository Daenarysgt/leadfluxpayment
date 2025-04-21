import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  description: string;
  features: string[];
  stripe_price_id_monthly: string;
  stripe_price_id_annual: string;
  is_popular?: boolean;
  backendId: string;
}

// Features para cada tipo de plano
const planFeatures = {
  basic: [
    '3 funis',
    'Até 10 mil leads',
    'Componentes Interativos',
    'Domínio Próprio',
    'Pixel e Trackeamento Meta Ads',
    'Gestao e Download dos leads',
    'Painel de métricas em tempo real',
    'Visualização de visitantes em tempo real dentro do funil'
  ],
  pro: [
    '6 funis',
    'Até 20 mil Leads',
    'Componentes Interativos',
    'Domínio Próprio',
    'Pixel e Trackeamento Meta Ads',
    'Gestao e Download dos leads',
    'Painel de métricas em tempo real',
    'Visualização de visitantes em tempo real dentro do funil'
  ],
  elite: [
    '12 funis',
    'Até 50 mil Leads',
    'Componentes Interativos',
    'Domínio Próprio',
    'Pixel e Trackeamento Meta Ads',
    'Gestao e Download dos leads',
    'Painel de métricas em tempo real',
    'Visualização de visitantes em tempo real dentro do funil'
  ],
  scale: [
    '30 funis',
    'Até 100 mil Leads',
    'Componentes Interativos',
    'Domínio Próprio',
    'Pixel e Trackeamento Meta Ads',
    'Gestao e Download dos leads',
    'Painel de métricas em tempo real',
    'Visualização de visitantes em tempo real dentro do funil'
  ]
};

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, session } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_monthly');

        if (error) throw error;
        
        const plansWithPopular = data?.map(plan => {
          // Determinar o ID do plano baseado no nome
          // O backend espera 'basic', 'pro', 'elite' ou 'scale' como ID
          let backendId = 'basic'; // valor padrão
          const planName = plan.name.toLowerCase();
          
          // Log para depuração do problema de mapeamento
          console.log('🔍 Analisando plano para mapeamento:', {
            planId: plan.id,
            planName: plan.name,
            planNameLower: planName
          });
          
          // Verificação mais rigorosa dos nomes dos planos
          if (planName.includes('basic')) {
            backendId = 'basic';
          } 
          else if (planName.includes('pro')) {
            backendId = 'pro';
          }
          else if (planName.includes('elite')) {
            backendId = 'elite';
          }
          else if (planName.includes('scale') || planName.includes('enterprise')) {
            backendId = 'scale';
          }
          
          console.log(`📋 Mapeando plano: ${plan.name} -> ID: ${backendId}`);
          
          // Usar as features predefinidas com base no backendId
          const features = planFeatures[backendId as keyof typeof planFeatures] || [];
          
          return {
            ...plan,
            backendId, // Adicionar ID para o backend
            is_popular: plan.name.toLowerCase().includes('pro'),
            features: features // Usar as features fixas em vez de buscar do banco
          };
        }) || [];
        
        setPlans(plansWithPopular);
      } catch (err) {
        console.error('Erro ao carregar planos:', err);
        setError('Não foi possível carregar os planos. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    console.log(`📋 Plano selecionado: ${plan.name} (${plan.id})`, plan);

    // Log detalhado para diagnóstico
    console.log('💡 Detalhes do plano selecionado:', {
      id: plan.id,
      backendId: plan.backendId,
      name: plan.name,
      nameLowercase: plan.name.toLowerCase(),
      allProps: Object.keys(plan)
    });

    // Validar o plano selecionado
    if (!plan || !plan.id) {
      console.error('❌ Plano inválido selecionado');
      toast({
        title: "Erro ao selecionar plano",
        description: "Ocorreu um erro ao selecionar o plano. Por favor, tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // Verificação do estado de autenticação
    console.log('👤 Estado de autenticação:', { usuarioLogado: !!session, userId: user?.id });
    
    // Usar o ID que o backend espera (basic, pro, elite, scale)
    const correctPlanId = plan.backendId || 'basic';
    console.log(`🔄 Usando ID do plano para o backend: ${correctPlanId}`);

    if (!session) {
      console.log('👤 Usuário não autenticado, redirecionando para registro');
      
      // Se não estiver logado, redireciona para registro com parâmetros na URL
      // Codificar os dados do plano como parâmetros de URL para maior confiabilidade
      const planParams = new URLSearchParams();
      planParams.set('plan_id', correctPlanId);
      planParams.set('interval', isAnnual ? 'year' : 'month');
      planParams.set('plan_name', encodeURIComponent(plan.name));
      planParams.set('timestamp', Date.now().toString());
      
      // Salvar também no localStorage para maior segurança
      const planData = {
        planId: correctPlanId,
        interval: isAnnual ? 'year' : 'month',
        planName: plan.name,
        timestamp: Date.now()
      };
      localStorage.setItem('selectedPlanInfo', JSON.stringify(planData));
      
      // Backup no sessionStorage caso o localStorage seja limpo
      sessionStorage.setItem('selectedPlanInfo_backup', JSON.stringify(planData));
      
      console.log('💾 Dados do plano salvos para uso após registro:', planData);
      
      navigate(`/register?${planParams.toString()}`, { 
        state: { 
          returnTo: '/checkout',
          selectedPlan: correctPlanId,
          interval: isAnnual ? 'year' : 'month'
        } 
      });
      return;
    }

    console.log('👤 Usuário autenticado, redirecionando para checkout');
    
    // Se estiver logado, redirecionar para página de checkout com parâmetros na URL
    const planParams = new URLSearchParams();
    planParams.set('plan_id', correctPlanId);
    planParams.set('interval', isAnnual ? 'year' : 'month');
    planParams.set('plan_name', encodeURIComponent(plan.name));
    planParams.set('timestamp', Date.now().toString());
    
    // Salvar também no localStorage para maior segurança
    const planData = {
      planId: correctPlanId,
      interval: isAnnual ? 'year' : 'month',
      planName: plan.name, 
      timestamp: Date.now()
    };
    localStorage.setItem('selectedPlanInfo', JSON.stringify(planData));
    sessionStorage.setItem('selectedPlanInfo_backup', JSON.stringify(planData));
    
    console.log('💾 Dados do plano salvos antes de redirecionar para checkout:', planData);
    
    navigate(`/checkout?${planParams.toString()}`, {
      state: {
        planId: correctPlanId,
        interval: isAnnual ? 'year' : 'month'
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-500 hover:text-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="pricing" 
      className="py-24 bg-gray-50"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900">
            Planos
          </h2>

          {/* Billing Switch com animação */}
          <motion.div 
            className="mt-8 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-l-lg transition-all duration-300 ${
                isAnnual 
                  ? 'bg-black text-white scale-105' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Anual <span className="text-blue-400 ml-1">-15%</span>
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-r-lg transition-all duration-300 ${
                !isAnnual 
                  ? 'bg-black text-white scale-105' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Mensal
            </button>
          </motion.div>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          <AnimatePresence>
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${
                  plan.is_popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 ring-4 ring-purple-600 ring-opacity-20'
                    : 'bg-white'
                } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div>
                  <h3 className={`text-2xl font-semibold ${plan.is_popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                    {plan.is_popular && (
                      <span className="ml-2 inline-block px-3 py-1 text-sm bg-black rounded-full text-white">
                        destaque
                      </span>
                    )}
                  </h3>
                  <p className={`mt-4 text-sm ${plan.is_popular ? 'text-gray-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  
                  {isAnnual && (
                    <p className={`mt-4 text-sm line-through ${plan.is_popular ? 'text-gray-200' : 'text-gray-400'}`}>
                      {`R$${(plan.price_monthly * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </p>
                  )}
                  
                  <p className={`mt-2 ${plan.is_popular ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-4xl font-bold">
                      {`R$${(isAnnual ? plan.price_annual : plan.price_monthly).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </span>
                    <span className="text-base font-medium">/{isAnnual ? 'ano' : 'mês'}</span>
                  </p>
                </div>

                <ul className="mt-10 space-y-4 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${
                        plan.is_popular 
                          ? 'text-white' 
                          : 'text-black'
                      }`}>
                        <CheckIcon />
                      </div>
                      <p className={`text-sm ${plan.is_popular ? 'text-gray-100' : 'text-gray-500'}`}>
                        {feature}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={processingPlanId === plan.id}
                    className={`w-full py-3 px-6 text-center rounded-lg text-base font-medium 
                      transition-all duration-300 relative overflow-hidden
                      ${plan.is_popular
                        ? 'bg-black text-white hover:bg-gray-900'
                        : 'bg-black text-white hover:bg-gray-900'
                      }
                      ${processingPlanId === plan.id ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'}
                    `}
                  >
                    {processingPlanId === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processando...</span>
                      </div>
                    ) : selectedPlan === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Plano Selecionado</span>
                      </div>
                    ) : (
                      'Selecionar'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
} 