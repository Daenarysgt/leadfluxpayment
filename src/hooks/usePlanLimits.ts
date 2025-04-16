import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

// Definição dos tipos
interface PlanLimits {
  maxFunnels: number;
  maxLeads: number;
}

interface PlanLimitsResponse {
  planId: string;
  limits: PlanLimits;
  usage: {
    funnels: number;
    // leads: number;
  };
  remaining: {
    funnels: number;
    // leads: number;
  };
  allPlans: Array<{
    id: string;
    name: string;
    limits: PlanLimits;
  }>;
}

// Backup local em caso de falha na API
const DEFAULT_LIMITS: Record<string, PlanLimits> = {
  free: { maxFunnels: 1, maxLeads: 1000 },
  basic: { maxFunnels: 3, maxLeads: 5000 },
  pro: { maxFunnels: 6, maxLeads: 10000 },
  elite: { maxFunnels: 12, maxLeads: 25000 },
  scale: { maxFunnels: 30, maxLeads: 100000 }
};

export function usePlanLimits() {
  const [data, setData] = useState<PlanLimitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLimits = async () => {
    try {
      setLoading(true);
      
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await axios.get<PlanLimitsResponse>(`${API_URL}/payment/plan-limits`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar limites do plano:', err);
      setError('Falha ao carregar limites do plano');
      
      // Usar localStorage como fallback
      const localPlanId = localStorage.getItem('subscription_planId') || 'free';
      
      // Criar objeto de resposta de fallback
      setData({
        planId: localPlanId,
        limits: DEFAULT_LIMITS[localPlanId] || DEFAULT_LIMITS.free,
        usage: {
          funnels: 0 // Não temos acesso à contagem real sem API
        },
        remaining: {
          funnels: DEFAULT_LIMITS[localPlanId]?.maxFunnels || 1
        },
        allPlans: Object.keys(DEFAULT_LIMITS).map(id => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          limits: DEFAULT_LIMITS[id]
        }))
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar limites ao montar o componente
  useEffect(() => {
    loadLimits();
  }, []);

  return {
    // Dados retornados
    planId: data?.planId,
    limits: data?.limits,
    usage: data?.usage,
    remaining: data?.remaining,
    allPlans: data?.allPlans,
    
    // Estado
    loading,
    error,
    
    // Funções úteis
    canCreateFunnel: () => {
      if (!data?.remaining) return false;
      return data.remaining.funnels > 0;
    },
    
    // Função para recarregar dados
    reload: loadLimits
  };
} 