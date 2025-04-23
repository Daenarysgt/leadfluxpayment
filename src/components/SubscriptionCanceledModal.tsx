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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4 text-amber-500">
            <AlertOctagon size={50} />
          </div>
          <DialogTitle className="text-xl text-center">Sua assinatura foi cancelada</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Para continuar utilizando o LeadFlux e todas as suas funcionalidades, 
            você precisa reativar sua assinatura.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6">
            <div className="flex justify-center space-x-2 mb-6">
              <Button
                variant={billingInterval === 'month' ? "default" : "outline"}
                onClick={() => setBillingInterval('month')}
                className="relative"
              >
                Mensal
                {billingInterval === 'month' && (
                  <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                    <CheckCircle className="h-4 w-4 text-white fill-green-500 stroke-white" />
                  </span>
                )}
              </Button>
              <Button
                variant={billingInterval === 'year' ? "default" : "outline"}
                onClick={() => setBillingInterval('year')}
                className="relative"
              >
                Anual
                {billingInterval === 'year' && (
                  <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                    <CheckCircle className="h-4 w-4 text-white fill-green-500 stroke-white" />
                  </span>
                )}
                <span className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                  <span className="bg-green-500 text-white text-[10px] font-medium px-1 py-0.5 rounded-sm">
                    -20%
                  </span>
                </span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((plan) => (
                <div 
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedPlan?.id === plan.id 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h3 className="font-medium">{plan.name}</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-2xl font-bold">
                      {`R$${getPlanPrice(plan.id, billingInterval).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </span>
                    <span className="text-gray-500">/{billingInterval === 'month' ? 'mês' : 'mês'}</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
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
            className="sm:w-auto w-full"
          >
            {loading ? "Processando..." : "Reativar assinatura"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 