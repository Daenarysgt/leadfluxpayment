import { supabase } from '@/lib/supabase';

/**
 * Serviço para obter métricas e dados para o dashboard
 */
export const dashboardService = {
  /**
   * Obtém métricas para os cards do dashboard
   * Usando funções SQL otimizadas para cada métrica
   */
  async getDashboardCardMetrics(): Promise<{
    total_funnels: number;
    total_sessions: number;
    completion_rate: number;
    interaction_rate: number;
  }> {
    try {
      console.log('Getting dashboard card metrics');
      
      // Chamar funções individualmente para facilitar a depuração
      const [totalFunnelsResult, totalSessionsResult, conversionRateResult, interactionRateResult] = await Promise.all([
        supabase.rpc('get_dashboard_total_funnels'),
        supabase.rpc('get_dashboard_total_sessions'),
        supabase.rpc('get_dashboard_conversion_rate'),
        supabase.rpc('get_dashboard_interaction_rate')
      ]);
      
      // Log detalhado de cada métrica para facilitar a depuração
      console.log('Total funnels result:', totalFunnelsResult);
      console.log('Total sessions result:', totalSessionsResult);
      console.log('Conversion rate result:', conversionRateResult);
      console.log('Interaction rate result:', interactionRateResult);
      
      // Verificar erros individuais
      if (totalFunnelsResult.error) {
        console.error('Error getting total funnels:', totalFunnelsResult.error);
      }
      
      if (totalSessionsResult.error) {
        console.error('Error getting total sessions:', totalSessionsResult.error);
      }
      
      if (conversionRateResult.error) {
        console.error('Error getting conversion rate:', conversionRateResult.error);
      }
      
      if (interactionRateResult.error) {
        console.error('Error getting interaction rate:', interactionRateResult.error);
      }
      
      // Construir o objeto de métricas
      const metrics = {
        total_funnels: totalFunnelsResult.data || 0,
        total_sessions: totalSessionsResult.data || 0,
        completion_rate: conversionRateResult.data || 0,
        interaction_rate: interactionRateResult.data || 0
      };
      
      console.log('Dashboard card metrics retrieved:', metrics);
      
      return metrics;
    } catch (error) {
      console.error('Unexpected error getting dashboard card metrics:', error);
      return {
        total_funnels: 0,
        total_sessions: 0,
        completion_rate: 0,
        interaction_rate: 0
      };
    }
  },
  
  /**
   * Obtém dados para o gráfico do dashboard
   * Usando uma função SQL otimizada para cada período
   */
  async getDashboardChartData(
    period: 'today' | '7days' | '30days'
  ): Promise<Array<{
    name: string;
    sessoes: number;
    concluidos: number;
  }>> {
    try {
      console.log('Getting dashboard chart data:', { period });
      
      const { data, error } = await supabase
        .rpc('get_dashboard_chart_metrics', { 
          p_period: period 
        });

      if (error) {
        console.error('Error getting dashboard chart data:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('No dashboard chart data found for period:', period);
        return [];
      }

      console.log(`Retrieved ${data.length} data points for period ${period}`);

      // Formatar datas para exibição
      return data.map(item => {
        // Formatação para período "today"
        if (period === 'today') {
          const date = new Date(item.time_period);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return {
            name: `${hours}:${minutes}`,
            sessoes: item.total_sessions || 0,
            concluidos: item.completed_sessions || 0
          };
        } 
        // Formatação para períodos de dias
        else {
          const date = new Date(item.time_period);
          const day = date.getDate();
          const month = date.getMonth() + 1;
          return {
            name: `${day}/${month}`,
            sessoes: item.total_sessions || 0,
            concluidos: item.completed_sessions || 0
          };
        }
      });
    } catch (error) {
      console.error('Unexpected error getting dashboard chart data:', error);
      return [];
    }
  }
}; 