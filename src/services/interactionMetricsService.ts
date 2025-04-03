import { supabase } from '@/lib/supabase';

export const interactionMetricsService = {
  /**
   * Registra uma interação com uma etapa do funil
   */
  async registerStepInteraction(funnelId: string, stepId: string, sessionId: string) {
    try {
      const { error } = await supabase
        .rpc('register_step_interaction', {
          p_funnel_id: funnelId,
          p_step_id: stepId,
          p_session_id: sessionId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error registering step interaction:', error);
      throw error;
    }
  },

  /**
   * Obtém a taxa geral de interação para o usuário atual
   */
  async getGeneralInteractionRate() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_general_interaction_rate', {
          p_user_id: user.id
        });

      if (error) throw error;

      return Number(data?.[0]?.interaction_rate || 0);
    } catch (error) {
      console.error('Error getting general interaction rate:', error);
      return 0;
    }
  }
}; 