import { supabase } from '@/lib/supabase';

/**
 * Serviço para gerenciar métricas dos funis
 */
export const metricsService = {
  /**
   * Obtém o total de visitantes de todos os funis do usuário
   */
  async getTotalVisitors() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Primeiro buscar os IDs dos funis do usuário
      const { data: funnels } = await supabase
        .from('funnels')
        .select('id')
        .eq('user_id', user.id);

      if (!funnels || funnels.length === 0) return 0;

      const funnelIds = funnels.map(f => f.id);

      const { count } = await supabase
        .from('funnel_access_logs')
        .select('*', { count: 'exact', head: true })
        .in('funnel_id', funnelIds);

      return count || 0;
    } catch (error) {
      console.error('Error getting total visitors:', error);
      return 0;
    }
  },

  /**
   * Calcula a taxa de interação dos funis
   * Considera o progresso em todas as etapas e o tempo gasto
   */
  async getInteractionRate() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Primeiro buscar os funis do usuário com seus passos
      const { data: funnels } = await supabase
        .from('funnels')
        .select('id, steps(id)')
        .eq('user_id', user.id);

      if (!funnels || funnels.length === 0) return 0;

      const funnelIds = funnels.map(f => f.id);
      
      // Calcular total de etapas para cada funil
      const funnelSteps = funnels.reduce((acc, funnel) => {
        acc[funnel.id] = funnel.steps?.length || 0;
        return acc;
      }, {} as Record<string, number>);

      // Buscar todos os logs de acesso com tempo gasto
      const { data: logs } = await supabase
        .from('funnel_access_logs')
        .select('funnel_id, step_reached, is_conversion, time_per_step')
        .in('funnel_id', funnelIds);

      if (!logs || logs.length === 0) return 0;

      // Calcular a taxa de progresso para cada log
      const progressRates = logs.map(log => {
        const totalSteps = funnelSteps[log.funnel_id];
        if (!totalSteps) return 0;
        
        // Se converteu, conta como 100%
        if (log.is_conversion) return 100;
        
        // Calcular progresso baseado na etapa atual
        const stepProgress = (log.step_reached / totalSteps) * 100;
        
        // Calcular engajamento baseado no tempo gasto
        const timePerStep = log.time_per_step || {};
        const totalTimeSpent = Object.values(timePerStep)
          .map(time => Number(time) || 0)
          .reduce((sum, time) => sum + time, 0);
        
        // Considerar tempo gasto (assumindo que 30 segundos é um bom tempo de engajamento)
        const timeEngagement = Math.min((totalTimeSpent / 30) * 100, 100);
        
        // Combinar progresso e engajamento (50% cada)
        return (stepProgress * 0.5) + (timeEngagement * 0.5);
      });

      // Calcular a média das taxas de progresso
      const averageRate = progressRates.reduce((sum, rate) => sum + rate, 0) / progressRates.length;
      
      return Number(averageRate.toFixed(1));
    } catch (error) {
      console.error('Error calculating interaction rate:', error);
      return 0;
    }
  },

  /**
   * Obtém o total de fluxos completos
   * (Usuários que chegaram até a última etapa)
   */
  async getCompletedFlows() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Primeiro buscar os IDs dos funis do usuário
      const { data: funnels } = await supabase
        .from('funnels')
        .select('id')
        .eq('user_id', user.id);

      if (!funnels || funnels.length === 0) return 0;

      const funnelIds = funnels.map(f => f.id);

      const { count } = await supabase
        .from('funnel_access_logs')
        .select('*', { count: 'exact', head: true })
        .in('funnel_id', funnelIds)
        .eq('is_conversion', true);

      return count || 0;
    } catch (error) {
      console.error('Error getting completed flows:', error);
      return 0;
    }
  },

  /**
   * Obtém todas as métricas de uma vez só
   * (Mais eficiente que chamar cada método separadamente)
   */
  async getAllMetrics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Current user:', user.id);

      // Primeiro buscar os funis do usuário
      const { data: funnels, error: funnelsError } = await supabase
        .from('funnels')
        .select('id')
        .eq('user_id', user.id);

      if (funnelsError) {
        console.error('Error fetching funnels:', funnelsError);
        return {
          totalVisitors: 0,
          interactionRate: 0,
          completedFlows: 0
        };
      }

      if (!funnels || funnels.length === 0) {
        console.log('No funnels found for user');
        return {
          totalVisitors: 0,
          interactionRate: 0,
          completedFlows: 0
        };
      }

      const funnelIds = funnels.map(f => f.id);
      console.log('Found funnels:', funnelIds);

      // Verificar se há logs para esses funis
      const { data: logs, error: logsError } = await supabase
        .from('funnel_access_logs')
        .select('*')
        .in('funnel_id', funnelIds);

      if (logsError) {
        console.error('Error checking logs:', logsError);
      } else {
        console.log('Found logs:', logs?.length || 0);
      }

      // Usar a função SQL personalizada para calcular métricas
      const { data: metrics, error: metricsError } = await supabase
        .rpc('get_funnel_metrics', {
          funnel_ids: funnelIds
        });

      if (metricsError) {
        console.error('Error fetching metrics:', metricsError);
        return {
          totalVisitors: 0,
          interactionRate: 0,
          completedFlows: 0
        };
      }

      console.log('Metrics calculated:', metrics);

      // A função agora retorna diretamente os totais
      const totals = metrics?.[0] || {
        total_visitors: 0,
        interaction_rate: 0,
        completed_flows: 0
      };

      // Formatar os números para melhor legibilidade
      const result = {
        totalVisitors: Number(totals.total_visitors) || 0,
        interactionRate: Math.round(Number(totals.interaction_rate) || 0),
        completedFlows: Number(totals.completed_flows) || 0
      };

      console.log('Final metrics:', result);
      return result;
    } catch (error) {
      console.error('Error in getAllMetrics:', error);
      return {
        totalVisitors: 0,
        interactionRate: 0,
        completedFlows: 0
      };
    }
  }
};

interface FunnelAccessLog {
  id: string;
  funnel_id: string;
  step_reached: number;
  is_conversion: boolean;
  time_per_step: Record<string, number>;
  created_at: string;
  updated_at: string;
  is_first_access: boolean;
} 