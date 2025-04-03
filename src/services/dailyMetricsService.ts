import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dailyMetricsService = {
  /**
   * Registra um novo acesso diário para um funil
   */
  async registerAccess(funnelId: string) {
    try {
      const sessionId = uuidv4(); // Gera um UUID único para a sessão
      
      const { error } = await supabase
        .rpc('register_daily_access', {
          p_funnel_id: funnelId,
          p_session_id: sessionId
        });

      if (error) throw error;
      
      return sessionId;
    } catch (error) {
      console.error('Error registering daily access:', error);
      throw error;
    }
  },

  /**
   * Obtém o total de acessos diários para o usuário atual
   */
  async getDailyAccessCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_daily_access_count', {
          p_user_id: user.id
        });

      if (error) throw error;

      return data?.[0]?.total_accesses || 0;
    } catch (error) {
      console.error('Error getting daily access count:', error);
      return 0;
    }
  }
}; 