import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const flowMetricsService = {
  /**
   * Registra o início do fluxo para um funil
   */
  async registerFlowStart(funnelId: string) {
    try {
      const sessionId = uuidv4(); // Gera um UUID único para a sessão
      
      const { error } = await supabase
        .rpc('register_flow_start', {
          p_funnel_id: funnelId,
          p_session_id: sessionId
        });

      if (error) throw error;
      
      return sessionId;
    } catch (error) {
      console.error('Error registering flow start:', error);
      throw error;
    }
  },

  /**
   * Registra a conclusão do fluxo para um funil
   */
  async registerFlowComplete(funnelId: string, sessionId: string) {
    try {
      const { error } = await supabase
        .rpc('register_flow_complete', {
          p_funnel_id: funnelId,
          p_session_id: sessionId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error registering flow completion:', error);
      throw error;
    }
  },

  /**
   * Obtém a taxa de conclusão de fluxo para o usuário atual
   */
  async getFlowCompletionRate() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_flow_completion_rate', {
          p_user_id: user.id
        });

      if (error) throw error;

      return Number(data?.[0]?.completion_rate || 0);
    } catch (error) {
      console.error('Error getting flow completion rate:', error);
      return 0;
    }
  }
}; 