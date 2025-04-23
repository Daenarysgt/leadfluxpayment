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
        console.log('Gerado novo sessionId:', currentSessionId);
      }

      console.log('Registrando acesso ao funil:', {funnelId, sessionId: currentSessionId});

      // Insert into funnel_progress
      const { data, error: progressError } = await supabase
        .rpc('update_funnel_progress', {
          p_funnel_id: funnelId,
          p_session_id: currentSessionId,
          p_current_step: 1,
          p_is_complete: false
        });

      if (progressError) {
        console.error('Error logging funnel progress:', progressError);
        console.error('Detalhes do erro:', {
          message: progressError.message,
          details: progressError.details,
          hint: progressError.hint,
          code: progressError.code
        });
        
        // Tentar um método alternativo se a RPC falhar
        try {
          console.log('Tentando registrar acesso diretamente na tabela...');
          const { error: insertError } = await supabase
            .from('funnel_access_logs')
            .insert({
              funnel_id: funnelId,
              session_id: currentSessionId,
              step_reached: 1,
              is_conversion: false,
              is_first_access: true
            });
            
          if (insertError) {
            console.error('Erro na inserção direta:', insertError);
          } else {
            console.log('Inserção direta bem-sucedida');
          }
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      } else {
        console.log('Progresso registrado com sucesso:', data);
      }

      // Sempre tente registrar também no funnel_flow_events para redundância
      try {
        const { error: flowError } = await supabase
          .rpc('register_flow_start', {
            p_funnel_id: funnelId,
            p_session_id: currentSessionId
          });
          
        if (flowError) {
          console.error('Erro ao registrar fluxo de início:', flowError);
        }
      } catch (flowErr) {
        console.error('Exceção ao registrar fluxo:', flowErr);
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
    interactionValue: string | null = null,
    button_id: string | null = null
  ): Promise<void> {
    try {
      // NOVA VALIDAÇÃO: Bloquear interações automáticas do tipo 'click' com button_id no formato "btn-step-X"
      if (interactionType === 'click' && button_id && /^btn-step-\d+$/.test(button_id)) {
        console.log('Ignorando registro automático de interação com button_id:', button_id);
        return; // Sai da função sem registrar a interação
      }
      
      // Usar sessionId fornecido ou o currentSessionId
      const activeSessionId = sessionId || currentSessionId;
      
      if (!activeSessionId) {
        throw new Error('No active session found');
      }

      console.log('Registrando interação:', {
        funnelId, 
        stepNumber, 
        sessionId: activeSessionId,
        interactionType,
        interactionValue,
        button_id
      });

      const { error } = await supabase
        .rpc('register_step_interaction', {
          p_funnel_id: funnelId,
          p_session_id: activeSessionId,
          p_step_number: stepNumber,
          p_interaction_type: interactionType,
          p_interaction_value: interactionValue,
          p_button_id: button_id
        });

      if (error) {
        console.error('Error registering step interaction:', error);
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Tentar método alternativo caso a RPC falhe
        try {
          console.log('Tentando registrar interação diretamente na tabela...');
          const { error: insertError } = await supabase
            .from('funnel_step_interactions')
            .insert({
              funnel_id: funnelId,
              session_id: activeSessionId,
              step_number: stepNumber,
              interaction_type: interactionType,
              interaction_value: interactionValue,
              button_id: button_id
            });
            
          if (insertError) {
            console.error('Erro na inserção direta de interação:', insertError);
          } else {
            console.log('Interação registrada com sucesso diretamente');
          }
        } catch (fallbackError) {
          console.error('Erro no fallback de interação:', fallbackError);
        }
      } else {
        console.log('Interação registrada com sucesso via RPC');
      }
    } catch (error) {
      console.error('Error registering step interaction:', error);
      throw error;
    }
  },
  
  /**
   * Registra uma interação específica para múltipla escolha usando a nova função SQL
   */
  async registerChoiceInteraction(
    funnelId: string,
    stepNumber: number,
    sessionId: string | null = null,
    interactionValue: string | null = null,
    button_id: string | null = null
  ): Promise<void> {
    try {
      // Usar sessionId fornecido ou o currentSessionId
      const activeSessionId = sessionId || currentSessionId;
      
      if (!activeSessionId) {
        throw new Error('No active session found');
      }

      const { error } = await supabase
        .rpc('register_choice_interaction', {
          p_funnel_id: funnelId,
          p_session_id: activeSessionId,
          p_step_number: stepNumber,
          p_interaction_value: interactionValue,
          p_button_id: button_id
        });

      if (error) {
        console.error('Error registering choice interaction:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error registering choice interaction:', error);
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

      console.log('Atualizando progresso:', {
        funnelId,
        stepNumber,
        sessionId: activeSessionId,
        isConversion
      });

      // Atualizar apenas o progresso, sem registrar interação
      const { data, error } = await supabase
        .rpc('update_funnel_progress', {
          p_funnel_id: funnelId,
          p_session_id: activeSessionId,
          p_current_step: stepNumber,
          p_is_complete: isConversion
        });

      if (error) {
        console.error('Error updating progress:', error);
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Tentar um método alternativo se a RPC falhar
        try {
          console.log('Tentando atualizar progresso diretamente na tabela...');
          const { error: upsertError } = await supabase
            .from('funnel_access_logs')
            .upsert({
              funnel_id: funnelId,
              session_id: activeSessionId,
              step_reached: stepNumber,
              is_conversion: isConversion,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'session_id'
            });
            
          if (upsertError) {
            console.error('Erro na atualização direta:', upsertError);
          } else {
            console.log('Atualização direta bem-sucedida');
          }
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      } else {
        console.log('Progresso atualizado com sucesso:', data);
      }

      // Não registrar interação automática ao apenas atualizar o progresso
      // Essa interação deve ser registrada apenas quando o usuário realmente interage com a etapa
      
      // Se for conversão, registrar no funnel_flow_events também
      if (isConversion) {
        const { error: flowError } = await supabase
          .rpc('register_flow_complete', {
            p_funnel_id: funnelId,
            p_session_id: activeSessionId
          });
          
        if (flowError) {
          console.error('Erro ao registrar conclusão de fluxo:', flowError);
        }
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
   * Obter estatísticas precisas de acesso para um funil
   */
  async getFunnelStats(funnelId: string): Promise<{ views: number; conversions: number }> {
    try {
      // Contar sessões únicas (views)
      const { data: sessions, error: viewsError } = await supabase
        .from('funnel_access_logs')
        .select('session_id')
        .eq('funnel_id', funnelId);
      
      // Contar sessões que são conversões
      const { data: conversions, error: conversionsError } = await supabase
        .from('funnel_access_logs')
        .select('session_id')
        .eq('funnel_id', funnelId)
        .eq('is_conversion', true);
      
      if (viewsError || conversionsError) {
        console.error('Erro ao obter estatísticas:', viewsError || conversionsError);
        return { views: 0, conversions: 0 };
      }
      
      // Contar sessões únicas
      const uniqueSessions = new Set();
      sessions?.forEach(session => uniqueSessions.add(session.session_id));
      
      // Contar conversões únicas
      const uniqueConversions = new Set();
      conversions?.forEach(session => uniqueConversions.add(session.session_id));
      
      console.log(`Estatísticas do funil: ${uniqueSessions.size} sessões únicas, ${uniqueConversions.size} conversões únicas`);
      
      return {
        views: uniqueSessions.size || 0,
        conversions: uniqueConversions.size || 0
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
      // MODIFICADO PARA TESTE: Usando a função de teste que prioriza interações 'choice'
      const { data, error } = await supabase
        .rpc('get_funnel_leads_with_interactions_test', {
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
          session_id: activeSessionId,
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
  },

  /**
   * Obtém dados históricos para o gráfico do dashboard
   * @param funnelId ID do funnel (ou null para todos os funis do usuário)
   * @param period Período para buscar dados ('today', '7days', '30days')
   * @returns Array com dados de sessões e conclusões por período
   */
  async getHistoricalChartData(
    period: 'today' | '7days' | '30days',
    funnelId: string | null = null
  ): Promise<Array<{
    name: string;
    sessoes: number;
    concluidos: number;
  }>> {
    try {
      console.log('Getting historical chart data:', { period, funnelId });
      
      const { data, error } = await supabase
        .rpc('get_historical_metrics', { 
          p_period: period,
          p_funnel_id: funnelId
        });

      if (error) {
        console.error('Error getting historical chart data:', error);
        // Retornar array vazio em caso de erro
        return [];
      }

      if (!data || data.length === 0) {
        console.log('No historical data found for period:', period);
        return [];
      }

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
      console.error('Unexpected error getting historical chart data:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  },
}; 