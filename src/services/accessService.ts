import { supabase } from '@/lib/supabase';
import bcryptjs from 'bcryptjs';
import { dailyMetricsService } from './dailyMetricsService';
import { flowMetricsService } from './flowMetricsService';
import { interactionMetricsService } from './interactionMetricsService';
import { v4 as uuidv4 } from 'uuid';

let currentSessionId: string | null = null;

/**
 * Serviço para gerenciar acesso aos funis, verificar senhas e registrar logs
 */
export const accessService = {
  /**
   * Verifica se um funil está acessível publicamente
   */
  async isFunnelAccessible(slug: string): Promise<{ accessible: boolean; funnel?: any; requiresPassword?: boolean }> {
    try {
      // Obter o funil pelo slug
      const { data: funnel, error } = await supabase
        .from('funnels')
        .select('id, name, visibility, password_hash, status, max_views')
        .eq('slug', slug)
        .single();
      
      if (error || !funnel) {
        console.error('Erro ao buscar funil:', error);
        return { accessible: false };
      }
      
      // Verificar se o funil está ativo
      if (funnel.status !== 'active') {
        console.log('Funil não está ativo');
        return { accessible: false };
      }
      
      // Se o funil é público, está acessível
      if (funnel.visibility === 'public') {
        return { accessible: true, funnel };
      }
      
      // Se o funil é privado, requer senha
      if (funnel.visibility === 'private') {
        return { 
          accessible: false, 
          requiresPassword: true,
          funnel
        };
      }
      
      // Se o funil é unlisted, está acessível apenas pelo link direto
      if (funnel.visibility === 'unlisted') {
        return { accessible: true, funnel };
      }
      
      // Por padrão, se a visibilidade não for reconhecida
      return { accessible: false };
    } catch (error) {
      console.error('Erro ao verificar acesso ao funil:', error);
      return { accessible: false };
    }
  },
  
  /**
   * Verifica se uma senha está correta para um funil
   */
  async verifyPassword(funnelId: string, password: string): Promise<boolean> {
    try {
      // Obter o hash da senha do funil
      const { data: funnel, error } = await supabase
        .from('funnels')
        .select('password_hash')
        .eq('id', funnelId)
        .single();
      
      if (error || !funnel || !funnel.password_hash) {
        console.error('Erro ao verificar senha:', error);
        return false;
      }
      
      // Comparar a senha usando bcrypt
      const isCorrect = await bcryptjs.compare(password, funnel.password_hash);
      return isCorrect;
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  },
  
  /**
   * Registra um acesso ao funil
   */
  async logAccess(funnelId: string): Promise<string> {
    try {
      if (!funnelId) {
        throw new Error('funnelId is required');
      }

      // Gerar novo sessionId apenas se não existir
      if (!currentSessionId) {
        currentSessionId = uuidv4();
      }

      // Insert into funnel_progress
      const { error: progressError } = await supabase
        .rpc('update_funnel_progress', {
          p_funnel_id: funnelId,
          p_session_id: currentSessionId,
          p_current_step: 1,
          p_is_complete: false
        });

      if (progressError) {
        console.error('Error logging funnel progress:', progressError);
        throw progressError;
      }

      return currentSessionId;
    } catch (error) {
      console.error('Error logging access:', error);
      throw error;
    }
  },
  
  /**
   * Registra uma interação específica em uma etapa do funil
   */
  async registerStepInteraction(
    funnelId: string,
    stepNumber: number,
    sessionId: string | null = null,
    interactionType: string = 'click',
    interactionValue: string | null = null
  ): Promise<void> {
    try {
      // Usar sessionId fornecido ou o currentSessionId
      const activeSessionId = sessionId || currentSessionId;
      
      if (!activeSessionId) {
        throw new Error('No active session found');
      }

      const { error } = await supabase
        .rpc('register_step_interaction', {
          p_funnel_id: funnelId,
          p_session_id: activeSessionId,
          p_step_number: stepNumber,
          p_interaction_type: interactionType,
          p_interaction_value: interactionValue
        });

      if (error) {
        console.error('Error registering step interaction:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error registering step interaction:', error);
      throw error;
    }
  },
  
  /**
   * Atualiza o progresso do usuário no funil
   */
  async updateProgress(
    funnelId: string, 
    stepNumber: number, 
    sessionId: string | null = null, 
    isConversion: boolean = false
  ): Promise<void> {
    try {
      // Usar sessionId fornecido ou o currentSessionId
      const activeSessionId = sessionId || currentSessionId;
      
      if (!activeSessionId) {
        throw new Error('No active session found');
      }

      // Atualizar apenas o progresso, sem registrar interação
      const { error } = await supabase
        .rpc('update_funnel_progress', {
          p_funnel_id: funnelId,
          p_session_id: activeSessionId,
          p_current_step: stepNumber,
          p_is_complete: isConversion
        });

      if (error) {
        console.error('Error updating progress:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },
  
  /**
   * Gerar hash de senha para armazenamento seguro
   */
  async hashPassword(password: string): Promise<string> {
    try {
      // Gerar salt e hash
      const salt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(password, salt);
      return hash;
    } catch (error) {
      console.error('Erro ao gerar hash de senha:', error);
      throw error;
    }
  },
  
  /**
   * Atualiza a senha de um funil
   */
  async updateFunnelPassword(funnelId: string, password: string | null): Promise<boolean> {
    try {
      let passwordHash = null;
      
      // Se uma senha foi fornecida, criar o hash
      if (password) {
        passwordHash = await this.hashPassword(password);
      }
      
      // Atualizar o funil
      const { error } = await supabase
        .from('funnels')
        .update({ password_hash: passwordHash })
        .eq('id', funnelId);
      
      if (error) {
        console.error('Erro ao atualizar senha do funil:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar senha do funil:', error);
      return false;
    }
  },
  
  /**
   * Atualiza a visibilidade de um funil
   */
  async updateFunnelVisibility(funnelId: string, visibility: 'public' | 'private' | 'unlisted'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('funnels')
        .update({ visibility })
        .eq('id', funnelId);
      
      if (error) {
        console.error('Erro ao atualizar visibilidade do funil:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar visibilidade do funil:', error);
      return false;
    }
  },
  
  /**
   * Obter estatísticas de acesso para um funil
   */
  async getFunnelStats(funnelId: string): Promise<{ views: number; conversions: number }> {
    try {
      // Contar visualizações
      const { count: viewsCount, error: viewsError } = await supabase
        .from('funnel_access_logs')
        .select('id', { count: 'exact', head: true })
        .eq('funnel_id', funnelId);
      
      // Contar conversões
      const { count: conversionsCount, error: conversionsError } = await supabase
        .from('funnel_access_logs')
        .select('id', { count: 'exact', head: true })
        .eq('funnel_id', funnelId)
        .eq('is_conversion', true);
      
      if (viewsError || conversionsError) {
        console.error('Erro ao obter estatísticas:', viewsError || conversionsError);
        return { views: 0, conversions: 0 };
      }
      
      return {
        views: viewsCount || 0,
        conversions: conversionsCount || 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { views: 0, conversions: 0 };
    }
  },
  
  /**
   * Obtém métricas do funil
   */
  async getFunnelMetrics(funnelId: string): Promise<{ 
    total_sessions: number; 
    completion_rate: number; 
    interaction_rate: number; 
  }> {
    try {
      console.log('Getting metrics for funnel:', funnelId);
      
      const { data, error } = await supabase
        .rpc('get_funnel_metrics', { 
          p_funnel_id: funnelId 
        });

      if (error) {
        console.error('Error getting funnel metrics:', {
          error,
          funnelId,
          message: error.message,
          details: error.details
        });
        return {
          total_sessions: 0,
          completion_rate: 0,
          interaction_rate: 0
        };
      }

      if (!data || data.length === 0) {
        console.log('No metrics found for funnel:', funnelId);
        return {
          total_sessions: 0,
          completion_rate: 0,
          interaction_rate: 0
        };
      }

      const metrics = data[0];
      console.log('Funnel metrics retrieved:', metrics);

      return {
        total_sessions: metrics.total_sessions || 0,
        completion_rate: metrics.completion_rate || 0,
        interaction_rate: metrics.interaction_rate || 0
      };
    } catch (error) {
      console.error('Unexpected error getting funnel metrics:', {
        error,
        funnelId
      });
      return {
        total_sessions: 0,
        completion_rate: 0,
        interaction_rate: 0
      };
    }
  },
  
  /**
   * Obtém métricas detalhadas por etapa do funil
   */
  async getFunnelStepMetrics(funnelId: string): Promise<Array<{
    stepNumber: number;
    totalInteractions: number;
    interactionRate: number;
    buttonId: string;
  }>> {
    try {
      console.log('Getting step metrics for funnel:', funnelId);
      
      const { data, error } = await supabase
        .rpc('get_funnel_step_metrics', { 
          p_funnel_id: funnelId 
        });

      if (error) {
        console.error('Error getting funnel step metrics:', {
          error,
          funnelId,
          message: error.message,
          details: error.details
        });
        return [];
      }

      if (!data || data.length === 0) {
        console.log('No step metrics found for funnel:', funnelId);
        return [];
      }

      console.log('Funnel step metrics retrieved:', data);

      return data.map(metric => ({
        stepNumber: metric.step_number,
        totalInteractions: metric.total_interactions,
        interactionRate: metric.interaction_rate,
        buttonId: metric.button_id
      }));
    } catch (error) {
      console.error('Unexpected error getting funnel step metrics:', {
        error,
        funnelId
      });
      return [];
    }
  },
  
  /**
   * Busca os leads do funil com suas interações
   */
  async getFunnelLeads(funnelId: string, period: 'all' | 'today' | '7days' | '30days' = 'all'): Promise<Array<{
    sessionId: string;
    firstInteraction: Date;
    interactions: {
      [stepNumber: number]: {
        status: 'clicked';
        timestamp: Date;
      };
    };
  }>> {
    try {
      const { data, error } = await supabase
        .rpc('get_funnel_leads', {
          p_funnel_id: funnelId,
          p_period: period
        });

      if (error) {
        console.error('Error fetching funnel leads:', error);
        return [];
      }

      return data.map((lead: any) => ({
        sessionId: lead.session_id,
        firstInteraction: new Date(lead.first_interaction),
        interactions: lead.interactions
      }));
    } catch (error) {
      console.error('Error fetching funnel leads:', error);
      return [];
    }
  },
  
  /**
   * Busca os leads do funil com suas interações reais (apenas cliques efetivos)
   */
  async getFunnelLeadsWithInteractions(funnelId: string, period: 'all' | 'today' | '7days' | '30days' = 'all'): Promise<Array<{
    sessionId: string;
    firstInteraction: Date;
    interactions: {
      [stepNumber: string]: {
        status: string;
        type: 'click' | 'choice';
        value?: string | null;
        timestamp: Date;
      };
    };
  }>> {
    try {
      const { data, error } = await supabase
        .rpc('get_funnel_leads_with_interactions', {
          p_funnel_id: funnelId,
          p_period: period
        });

      if (error) {
        console.error('Error fetching funnel leads with interactions:', error);
        return [];
      }

      return data.map((lead: any) => ({
        sessionId: lead.session_id,
        firstInteraction: new Date(lead.first_interaction),
        interactions: lead.interactions
      }));
    } catch (error) {
      console.error('Error fetching funnel leads with interactions:', error);
      return [];
    }
  },

  /**
   * Salva os dados do formulário de captura
   */
  async saveCaptureFormData(
    funnelId: string,
    sessionId: string | null = null,
    formData: Record<string, string>
  ): Promise<void> {
    try {
      // Usar sessionId fornecido ou o currentSessionId
      const activeSessionId = sessionId || currentSessionId;
      
      if (!activeSessionId) {
        throw new Error('No active session found');
      }

      console.log('Salvando dados do formulário:', {
        funnelId, 
        sessionId: activeSessionId,
        formData
      });

      // Inserir na tabela funnel_responses
      const { error } = await supabase
        .from('funnel_responses')
        .insert({
          funnel_id: funnelId,
          lead_info: formData,
          answers: {},
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving form data:', error);
        throw error;
      }

      console.log('Dados do formulário salvos com sucesso');
    } catch (error) {
      console.error('Error saving form data:', error);
      throw error;
    }
  },

  /**
   * Busca os dados de formulários do funil
   */
  async getFunnelFormData(funnelId: string, period: 'all' | 'today' | '7days' | '30days' = 'all'): Promise<Array<{
    sessionId: string;
    submissionTime: Date;
    leadInfo: Record<string, string>;
  }>> {
    try {
      const { data, error } = await supabase
        .rpc('get_funnel_form_data', {
          p_funnel_id: funnelId,
          p_period: period
        });

      if (error) {
        console.error('Error fetching funnel form data:', error);
        return [];
      }

      return data.map((item: any) => ({
        sessionId: item.session_id,
        submissionTime: new Date(item.submission_time),
        leadInfo: item.lead_info
      }));
    } catch (error) {
      console.error('Error fetching funnel form data:', error);
      return [];
    }
  }
}; 