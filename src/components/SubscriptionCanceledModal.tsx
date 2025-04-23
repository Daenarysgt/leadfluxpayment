import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertOctagon, CheckCircle } from "lucide-react";
import { PLANS } from '@/config/plans';
import { toast } from '@/components/ui/use-toast';
import { paymentService } from '@/services/paymentService';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface SubscriptionCanceledModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Preços padrão para cada plano (caso não consiga carregar do banco)
const DEFAULT_PRICES = {
  basic: { monthly: 97, annual: 77 },
  pro: { monthly: 197, annual: 157 },
  elite: { monthly: 297, annual: 237 },
  scale: { monthly: 497, annual: 397 }
};

// Componente de check para features
const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function SubscriptionCanceledModal({ open, onOpenChange }: SubscriptionCanceledModalProps) {
  const [loading, setLoading] = useState(false);
  const [planPrices, setPlanPrices] = useState<Record<string, { monthly: number, annual: number }>>(DEFAULT_PRICES);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const navigate = useNavigate();
  
  // Estado para armazenar plano e intervalo selecionados
  const [selectedPlan, setSelectedPlan] = useState(PLANS.find(plan => plan.id === 'pro'));
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  // Carrega os preços dos planos do banco de dados
  useEffect(() => {
    const fetchPlanPrices = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_monthly');
        
        if (error) {
          console.error('Erro ao buscar preços:', error);
          return;
        }
        
        // Mapear os dados para o formato esperado
        if (data && data.length > 0) {
          const priceMap: Record<string, { monthly: number, annual: number }> = {};
          
          data.forEach(plan => {
            // Determinar o ID do plano baseado no nome
            let backendId = 'basic'; // valor padrão
            const planName = plan.name.toLowerCase();
            
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
            
            priceMap[backendId] = {
              monthly: plan.price_monthly || DEFAULT_PRICES[backendId as keyof typeof DEFAULT_PRICES].monthly,
              annual: plan.price_annual || DEFAULT_PRICES[backendId as keyof typeof DEFAULT_PRICES].annual
            };
          });
          
          setPlanPrices(priceMap);
        }
      } catch (err) {
        console.error('Erro ao carregar preços dos planos:', err);
      } finally {
        setLoadingPrices(false);
      }
    };
    
    fetchPlanPrices();
  }, []);

  const handleNavigateToCheckout = async () => {
    if (!selectedPlan) return;
    
    try {
      setLoading(true);
      
      const checkoutUrl = await paymentService.createCheckoutSession(
        selectedPlan.id,
        billingInterval
      );
      
      if (checkoutUrl) {
        // Redirecionar para o checkout do Stripe
        window.location.href = checkoutUrl.url;
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao criar sessão de checkout",
          description: "Não foi possível processar sua solicitação. Por favor, tente novamente."
        });
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar sessão de checkout",
        description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para pegar o preço correto do plano
  const getPlanPrice = (planId: string, interval: 'month' | 'year') => {
    const defaultPrice = DEFAULT_PRICES[planId as keyof typeof DEFAULT_PRICES];
    const price = planPrices[planId];
    
    if (!price) {
      return interval === 'month' 
        ? defaultPrice?.monthly || 97 
        : defaultPrice?.annual || 77;
    }
    
    return interval === 'month' ? price.monthly : price.annual;
  };

  // Verificar se um plano é popular
  const isPlanPopular = (planId: string) => planId === 'pro';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <div className="flex items-center justify-center mb-4 text-amber-500">
            <AlertOctagon size={50} />
          </div>
          <DialogTitle className="text-xl text-center">Sua assinatura foi cancelada</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Para continuar utilizando o LeadFlux e todas as suas funcionalidades, 
            você precisa reativar sua assinatura.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {/* Billing Switch com animação */}
          <motion.div 
            className="mt-4 flex items-center justify-center gap-3 mb-8"
            whileHover={{ scale: 1.02 }}
          >
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-4 py-2 rounded-l-lg transition-all duration-300 ${
                billingInterval === 'year' 
                  ? 'bg-black text-white scale-105' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Anual <span className="text-blue-400 ml-1">-20%</span>
            </button>
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-4 py-2 rounded-r-lg transition-all duration-300 ${
                billingInterval === 'month' 
                  ? 'bg-black text-white scale-105' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Mensal
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {PLANS.map((plan, index) => {
                const isPopular = isPlanPopular(plan.id);
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-xl p-4 flex flex-col h-full transition-all duration-300 cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ring-4 ring-purple-600 ring-opacity-20'
                        : 'bg-white border border-gray-200'
                    } ${selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div>
                      <h3 className={`text-lg font-medium ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                        {plan.name}
                        {isPopular && (
                          <span className="ml-2 inline-block px-2 py-0.5 text-xs bg-black rounded-full text-white">
                            destaque
                          </span>
                        )}
                      </h3>
                      <p className={`mt-1 text-sm ${isPopular ? 'text-gray-100' : 'text-gray-500'}`}>
                        {plan.description}
                      </p>
                      
                      {billingInterval === 'year' && (
                        <p className={`mt-1 text-sm line-through ${isPopular ? 'text-gray-200' : 'text-gray-400'}`}>
                          {`R$${(getPlanPrice(plan.id, 'month') * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </p>
                      )}
                      
                      <div className={`mt-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-2xl font-bold whitespace-nowrap">
                          R${getPlanPrice(plan.id, billingInterval).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm font-medium">/{billingInterval === 'month' ? 'mês' : 'ano'}</span>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 flex-grow">
                      {plan.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <div className={`flex-shrink-0 ${
                            isPopular 
                              ? 'text-white' 
                              : 'text-black'
                          }`}>
                            <CheckIcon />
                          </div>
                          <p className={`text-xs ${isPopular ? 'text-gray-100' : 'text-gray-500'}`}>
                            {feature}
                          </p>
                        </li>
                      ))}
                    </ul>

                    {selectedPlan?.id === plan.id && (
                      <div className="mt-4 bg-blue-100 text-blue-800 rounded-lg py-1 px-2 text-xs font-medium text-center">
                        Plano selecionado
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="sm:w-auto w-full"
          >
            Sair
          </Button>
          <Button 
            onClick={handleNavigateToCheckout} 
            disabled={loading}
            className="sm:w-auto w-full bg-black hover:bg-gray-800 text-white"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </div>
            ) : "Reativar assinatura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 