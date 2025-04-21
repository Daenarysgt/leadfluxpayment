import { supabase } from '@/lib/supabase';

// Cache para armazenar dados e evitar requisições repetidas
const cache = {
  cardMetrics: {
    data: null,
    timestamp: 0,
    ttl: 2 * 60 * 1000, // 2 minutos
  },
  chartData: {
    today: { data: null, timestamp: 0 },
    '7days': { data: null, timestamp: 0 },
    '30days': { data: null, timestamp: 0 },
    ttl: 5 * 60 * 1000, // 5 minutos
  }
};

/**
 * Serviço para obter métricas e dados para o dashboard
 */
export const dashboardService = {
  /**
   * Obtém métricas para os cards do dashboard
   * Usando funções SQL otimizadas para cada métrica
   */
  async getDashboardCardMetrics(forceRefresh = false): Promise<{
    total_funnels: number;
    total_sessions: number;
    completion_rate: number;
    interaction_rate: number;
  }> {
    try {
      const now = Date.now();
      
      // Verificar cache se não for forçada a atualização
      if (!forceRefresh && 
          cache.cardMetrics.data && 
          now - cache.cardMetrics.timestamp < cache.cardMetrics.ttl) {
        console.log('Usando dados em cache para métricas de cards');
        return cache.cardMetrics.data;
      }
      
      console.log('Buscando novas métricas de cards do dashboard');
      
      // Chamar funções individualmente para facilitar a depuração
      const [totalFunnelsResult, totalSessionsResult, conversionRateResult, interactionRateResult] = await Promise.all([
        supabase.rpc('get_dashboard_total_funnels'),
        supabase.rpc('get_dashboard_total_sessions'),
        supabase.rpc('get_dashboard_conversion_rate'),
        supabase.rpc('get_dashboard_interaction_rate')
      ]);
      
      // Verificar erros individuais
      if (totalFunnelsResult.error) {
        console.error('Erro ao buscar total de funis:', totalFunnelsResult.error);
      }
      
      if (totalSessionsResult.error) {
        console.error('Erro ao buscar total de sessões:', totalSessionsResult.error);
      }
      
      if (conversionRateResult.error) {
        console.error('Erro ao buscar taxa de conversão:', conversionRateResult.error);
      }
      
      if (interactionRateResult.error) {
        console.error('Erro ao buscar taxa de interação:', interactionRateResult.error);
      }
      
      // Construir o objeto de métricas
      const metrics = {
        total_funnels: totalFunnelsResult.data || 0,
        total_sessions: totalSessionsResult.data || 0,
        completion_rate: conversionRateResult.data || 0,
        interaction_rate: interactionRateResult.data || 0
      };
      
      console.log('Métricas de cards atualizadas:', metrics);
      
      // Atualizar cache
      cache.cardMetrics.data = metrics;
      cache.cardMetrics.timestamp = now;
      
      return metrics;
    } catch (error) {
      console.error('Erro inesperado ao buscar métricas dos cards:', error);
      
      // Se houver dados em cache, usar como fallback
      if (cache.cardMetrics.data) {
        console.log('Usando dados em cache como fallback após erro');
        return cache.cardMetrics.data;
      }
      
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
    period: 'today' | '7days' | '30days',
    forceRefresh = false
  ): Promise<Array<{
    name: string;
    sessoes: number;
    concluidos: number;
  }>> {
    try {
      const now = Date.now();
      
      // Verificar cache se não for forçada a atualização
      if (!forceRefresh && 
          cache.chartData[period].data && 
          now - cache.chartData[period].timestamp < cache.chartData.ttl) {
        console.log(`Usando dados em cache para gráfico (${period})`);
        return cache.chartData[period].data;
      }
      
      console.log(`Buscando novos dados de gráfico: ${period}`);
      
      const { data, error } = await supabase
        .rpc('get_dashboard_chart_metrics', { 
          p_period: period 
        });

      if (error) {
        console.error(`Erro ao buscar dados do gráfico (${period}):`, error);
        return cache.chartData[period].data || [];
      }

      if (!data || data.length === 0) {
        console.log(`Nenhum dado encontrado para o período: ${period}`);
        return [];
      }

      // Formatar datas para exibição
      const formattedData = data.map(item => {
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
      
      // Atualizar cache
      cache.chartData[period].data = formattedData;
      cache.chartData[period].timestamp = now;
      
      return formattedData;
    } catch (error) {
      console.error(`Erro inesperado ao buscar dados do gráfico (${period}):`, error);
      
      // Se houver dados em cache, usar como fallback
      if (cache.chartData[period].data) {
        console.log('Usando dados em cache como fallback após erro');
        return cache.chartData[period].data;
      }
      
      return [];
    }
  },
  
  /**
   * Força a atualização de todos os dados
   */
  async refreshAllData() {
    try {
      console.log('Forçando atualização de todos os dados do dashboard');
      
      // Limpar cache
      cache.cardMetrics.data = null;
      cache.cardMetrics.timestamp = 0;
      cache.chartData.today.data = null;
      cache.chartData.today.timestamp = 0;
      cache.chartData['7days'].data = null;
      cache.chartData['7days'].timestamp = 0;
      cache.chartData['30days'].data = null;
      cache.chartData['30days'].timestamp = 0;
      
      // Buscar novos dados
      const [metrics, todayChart, weekChart, monthChart] = await Promise.all([
        this.getDashboardCardMetrics(true),
        this.getDashboardChartData('today', true),
        this.getDashboardChartData('7days', true),
        this.getDashboardChartData('30days', true)
      ]);
      
      return {
        metrics,
        charts: {
          today: todayChart,
          '7days': weekChart,
          '30days': monthChart
        }
      };
    } catch (error) {
      console.error('Erro ao atualizar todos os dados:', error);
      throw error;
    }
  }
}; 