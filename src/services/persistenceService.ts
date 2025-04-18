import { Funnel, Step, Question } from "@/utils/types";
import { funnelService } from "./funnelService";
import { supabase } from "@/lib/supabase";

/**
 * Formata data ISO em formato compatível com Supabase
 */
function formatDateForSupabase() {
  return new Date().toISOString();
}

/**
 * Verifica se o usuário está autenticado e retorna o ID
 * Lança erro se o usuário não estiver autenticado
 */
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  if (!user.id) throw new Error('Invalid user ID');
  return user.id;
}

// Tipo para o resultado de operações de persistência
type PersistenceResult<T> = {
  success: boolean;
  data: T;
  error?: any;
};

// Constante para evitar salvar muitas vezes seguidas
const DEBOUNCE_INTERVAL = 1500; // 1.5 segundos

// Cache para evitar salvamentos repetitivos
const saveTimers = new Map();

/**
 * Serviço unificado para persistência de dados no sistema
 * Centraliza a lógica de salvamento e garante consistência
 */
export const persistenceService = {
  /**
   * Salva um funil completo, garantindo que todos os dados
   * sejam persistidos corretamente no Supabase, incluindo steps
   */
  async saveFunnel(funnel: Funnel): Promise<PersistenceResult<Funnel>> {
    try {
      // Verificar autenticação
      const userId = await getCurrentUserId();
      
      console.log('PersistenceService - Iniciando salvamento do funil:', funnel.id);
      
      // Verificar se o funil pertence ao usuário atual
      if (funnel.user_id && funnel.user_id !== userId) {
        console.error(`PersistenceService - Tentativa de salvar funil de outro usuário: ${funnel.user_id} vs ${userId}`);
        return {
          success: false,
          error: new Error('Unauthorized: Funnel belongs to another user'),
          data: funnel
        };
      }
      
      // Evitar salvar o mesmo funil várias vezes em curto intervalo
      const existingTimer = saveTimers.get(funnel.id);
      if (existingTimer) {
        console.log(`PersistenceService - Já existe um salvamento agendado para o funil ${funnel.id}, agrupando operações`);
        clearTimeout(existingTimer.timer);
        
        // Atualizar o objeto de funil no timer para ter os dados mais recentes
        existingTimer.funnel = funnel;
        
        // Criar nova promessa
        const promise = new Promise<PersistenceResult<Funnel>>((resolve) => {
          existingTimer.timer = setTimeout(async () => {
            try {
              const result = await this._saveAllFunnelData(existingTimer.funnel);
              saveTimers.delete(funnel.id);
              resolve(result);
            } catch (error) {
              saveTimers.delete(funnel.id);
              resolve({
                success: false,
                error,
                data: funnel
              });
            }
          }, DEBOUNCE_INTERVAL);
        });
        
        return promise;
      }
      
      // Criar novo timer para este funil
      const promise = new Promise<PersistenceResult<Funnel>>((resolve) => {
        const timer = setTimeout(async () => {
          try {
            const result = await this._saveAllFunnelData(funnel);
            saveTimers.delete(funnel.id);
            resolve(result);
          } catch (error) {
            saveTimers.delete(funnel.id);
            resolve({
              success: false,
              error,
              data: funnel
            });
          }
        }, DEBOUNCE_INTERVAL);
        
        saveTimers.set(funnel.id, { timer, funnel, promise });
      });
      
      return promise;
    } catch (error) {
      console.error("PersistenceService - Erro ao persistir funil:", error);
      return {
        success: false,
        error,
        data: funnel
      };
    }
  },
  
  /**
   * Método interno que realiza o salvamento efetivo de todos os dados do funil
   * Usado pelo método saveFunnel com debounce
   */
  async _saveAllFunnelData(funnel: Funnel): Promise<PersistenceResult<Funnel>> {
    try {
      // Verificar autenticação
      const userId = await getCurrentUserId();
      
      console.log('PersistenceService - Enviando atualização para o Supabase:', funnel.id);
      
      // 1. Dados básicos do funil
      const funnelBasic = {
        id: funnel.id,
        name: funnel.name,
        description: funnel.description,
        status: funnel.status,
        settings: funnel.settings,
        user_id: userId, // Garantir que o user_id seja o do usuário atual
        updated_at: formatDateForSupabase()
      };
      
      // Validar dados básicos antes de persistir
      if (!this.validateFunnelBasic(funnelBasic)) {
        console.error('PersistenceService - Dados do funil inválidos:', funnelBasic);
        return {
          success: false,
          data: funnel,
          error: new Error('Dados do funil inválidos')
        };
      }
      
      // 2. Persistir o funil básico
      const updatedFunnel = await funnelService.updateFunnel(funnel.id, funnelBasic);
      
      // 3. Garantir persistência de cada step com seus canvasElements e questions
      if (funnel.steps && funnel.steps.length > 0) {
        console.log(`PersistenceService - Salvando ${funnel.steps.length} steps com todos os dados relacionados`);
        
        // Obter steps existentes no Supabase
        const { data: existingSteps } = await supabase
          .from('steps')
          .select('*')
          .eq('funnel_id', funnel.id);
          
        console.log(`PersistenceService - ${existingSteps?.length || 0} steps existentes`);
        
        // Mapear IDs existentes para facilitar verificação
        const existingStepIds = new Set(existingSteps?.map(s => s.id) || []);
        
        // Persistir cada step do funil
        for (let i = 0; i < funnel.steps.length; i++) {
          const step = funnel.steps[i];
          
          // Encontrar o step para atualizar
          const stepIndex = funnel.steps.findIndex((s) => s.id === step.id);
          if (stepIndex === -1) {
            console.error(`CanvasActions - Step ${step.id} não encontrado no funil`);
            throw new Error(`Step ${step.id} não encontrado`);
          }
          
          // Dados básicos do step para persistência
          const baseStepData = {
            id: step.id,
            title: step.title,
            funnel_id: funnel.id,
            order_index: i,
            canvasElements: step.canvasElements || [], // Garantir que canvasElements sejam salvos
            buttonText: step.buttonText || 'Continuar',
            updated_at: formatDateForSupabase()
          };
          
          // Tentativa com todos os campos primeiro
          try {
            // Dados completos com todos os campos
            const fullStepData = {
              ...baseStepData,
              backButtonText: step.backButtonText || 'Voltar',
              showProgressBar: step.showProgressBar !== undefined ? step.showProgressBar : true,
            };
            
            console.log(`PersistenceService - Enviando step para Supabase com ${fullStepData.canvasElements.length} elementos`);
            
            if (existingStepIds.has(step.id)) {
              // Atualizar step existente com canvasElements
              const { error } = await supabase
                .from('steps')
                .update(fullStepData)
                .eq('id', step.id);
                
              if (error) {
                if (error.message && (error.message.includes('backButtonText') || error.message.includes('schema cache') || error.message.includes('column'))) {
                  throw new Error('Schema issue detected');
                }
                console.error(`PersistenceService - Erro ao atualizar step ${step.id}:`, error);
                throw error;
              }
              
              console.log(`PersistenceService - Step ${step.id} atualizado com ${step.canvasElements?.length || 0} elementos`);
            } else {
              // Criar novo step
              const { data: newStep, error } = await supabase
                .from('steps')
                .insert([{
                  ...fullStepData,
                  funnel_id: funnel.id, // Garantir que funnel_id está definido
                  created_at: formatDateForSupabase()
                }])
                .select()
                .single();
                
              if (error) {
                if (error.message && (error.message.includes('backButtonText') || error.message.includes('schema cache') || error.message.includes('column'))) {
                  throw new Error('Schema issue detected');
                }
                console.error(`PersistenceService - Erro ao criar novo step:`, error);
                throw error;
              } else if (newStep) {
                funnel.steps[i].id = newStep.id; // Atualizar ID no estado local
                console.log(`PersistenceService - Novo step criado com ID ${newStep.id}`);
              }
            }
          } catch (schemaError) {
            // Se o erro for relacionado ao schema, tentar apenas com os campos essenciais
            console.log(`PersistenceService - Detectado erro de schema, tentando com campos reduzidos:`, schemaError);
            
            if (existingStepIds.has(step.id)) {
              // Atualizar step existente com apenas campos essenciais
              const { error } = await supabase
                .from('steps')
                .update(baseStepData)
                .eq('id', step.id);
                
              if (error) {
                console.error(`PersistenceService - Erro ao atualizar step com campos reduzidos:`, error);
                throw error;
              }
              
              console.log(`PersistenceService - Step ${step.id} atualizado com ${step.canvasElements?.length || 0} elementos (versão reduzida)`);
            } else {
              // Criar novo step com apenas campos essenciais
              const { data: newStep, error } = await supabase
                .from('steps')
                .insert([{
                  ...baseStepData,
                  funnel_id: funnel.id, // Garantir que funnel_id está definido
                  created_at: formatDateForSupabase()
                }])
                .select()
                .single();
                
              if (error) {
                console.error(`PersistenceService - Erro ao criar novo step com campos reduzidos:`, error);
                throw error;
              } else if (newStep) {
                funnel.steps[i].id = newStep.id; // Atualizar ID no estado local
                console.log(`PersistenceService - Novo step criado com ID ${newStep.id} (versão reduzida)`);
              }
            }
          }
          
          // Persistir questions deste step se houver
          if (step.questions && step.questions.length > 0 && step.id) {
            await this.persistQuestions(step.questions, step.id);
          }
        }
        
        // Remover steps que existem no Supabase mas não estão mais no funil
        if (existingSteps && existingSteps.length > 0) {
          const currentStepIds = new Set(funnel.steps.map(s => s.id));
          const stepsToDelete = existingSteps.filter(s => !currentStepIds.has(s.id));
          
          if (stepsToDelete.length > 0) {
            console.log(`PersistenceService - Removendo ${stepsToDelete.length} steps obsoletos`);
            
            for (const stepToDelete of stepsToDelete) {
              await supabase
                .from('steps')
                .delete()
                .eq('id', stepToDelete.id);
            }
          }
        }
      }
      
      // 4. Buscar funil atualizado com todos os steps
      const { data: refreshedFunnel } = await supabase
        .from('funnels')
        .select(`
          *,
          steps (
            *,
            questions (*)
          )
        `)
        .eq('id', funnel.id)
        .single();
      
      if (refreshedFunnel) {
        // Organizar steps por posição
        if (refreshedFunnel.steps) {
          refreshedFunnel.steps.sort((a, b) => {
            if (a.position !== undefined && b.position !== undefined) {
              return a.position - b.position;
            }
            return 0;
          });
        }
        
        console.log(`PersistenceService - Funil salvo com ${refreshedFunnel.steps?.length || 0} steps e todos os dados relacionados`);
        return {
          success: true,
          data: refreshedFunnel
        };
      }
      
      // Fallback: usar dados locais se refresh falhar
      return {
        success: true,
        data: {
          ...updatedFunnel,
          steps: funnel.steps
        }
      };
    } catch (error) {
      console.error("PersistenceService - Erro ao persistir dados completos do funil:", error);
      return {
        success: false,
        error,
        data: funnel
      };
    }
  },
  
  /**
   * Persiste as questions de um step
   */
  async persistQuestions(questions: Question[], stepId: string): Promise<boolean> {
    try {
      if (!questions || !stepId) return false;
      
      console.log(`PersistenceService - Salvando ${questions.length} questions para o step ${stepId}`);
      
      // Buscar questions existentes deste step
      const { data: existingQuestions } = await supabase
        .from('questions')
        .select('*')
        .eq('step_id', stepId);
        
      // Mapear IDs existentes para facilitar verificação
      const existingQuestionIds = new Set(existingQuestions?.map(q => q.id) || []);
      
      // Persistir cada question
      for (const question of questions) {
        const questionData = {
          type: question.type,
          title: question.title,
          description: question.description,
          options: question.options,
          required: question.required,
          configuration: question.configuration,
          updated_at: formatDateForSupabase()
        };
        
        if (existingQuestionIds.has(question.id)) {
          // Atualizar question existente
          await supabase
            .from('questions')
            .update(questionData)
            .eq('id', question.id);
        } else {
          // Criar nova question
          await supabase
            .from('questions')
            .insert([{
              ...questionData,
              step_id: stepId,
              created_at: formatDateForSupabase(),
              id: question.id
            }]);
        }
      }
      
      // Remover questions que não existem mais
      if (existingQuestions && existingQuestions.length > 0) {
        const currentQuestionIds = new Set(questions.map(q => q.id));
        const questionsToRemove = existingQuestions.filter(q => !currentQuestionIds.has(q.id));
        
        if (questionsToRemove.length > 0) {
          console.log(`PersistenceService - Removendo ${questionsToRemove.length} questions obsoletas`);
          
          for (const questionToRemove of questionsToRemove) {
            await supabase
              .from('questions')
              .delete()
              .eq('id', questionToRemove.id);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error(`PersistenceService - Erro ao persistir questions do step ${stepId}:`, error);
      return false;
    }
  },
  
  /**
   * Persiste um step individual no Supabase
   */
  async persistStep(step: Step, funnelId: string): Promise<boolean> {
    try {
      console.log(`PersistenceService - Persistindo step ${step.id || 'novo'} para o funil ${funnelId}`);
      
      // Verificar se temos o adaptador disponível e usar se existir
      if (window.stepsDatabaseAdapter && step.id) {
        // Usar o adaptador para salvar elementos do canvas
        console.log(`PersistenceService - Usando adaptador para salvar ${step.canvasElements?.length || 0} elementos`);
        const success = await window.stepsDatabaseAdapter.saveCanvasElements(
          step.id, 
          step.canvasElements || []
        );
        
        if (success) {
          console.log(`PersistenceService - Elementos salvos com sucesso via adaptador`);
          return true;
        }
        console.log(`PersistenceService - Adaptador falhou, tentando método padrão`);
      }
      
      // Continuar com o método padrão se o adaptador não estiver disponível ou falhar
      // Dados básicos essenciais do step para persistência
      const baseStepData = {
        title: step.title,
        order_index: step.position || 0,
        canvasElements: step.canvasElements || [],
        buttonText: step.buttonText || 'Continuar',
        updated_at: formatDateForSupabase()
      };
      
      // Tentar com todos os campos primeiro
      try {
        // Dados completos com todos os campos
        const fullStepData = {
          ...baseStepData,
          backButtonText: step.backButtonText || 'Voltar',
          showProgressBar: step.showProgressBar !== undefined ? step.showProgressBar : true,
        };
        
        console.log('PersistenceService - Tentando com todos os campos:', 
          JSON.stringify({...fullStepData, canvasElements: `[${fullStepData.canvasElements.length} elementos]`}, null, 2));
        
        if (step.id) {
          // Atualizar step existente
          const { error } = await supabase
            .from('steps')
            .update(fullStepData)
            .eq('id', step.id);
            
          if (error) {
            if (error.message && (error.message.includes('backButtonText') || error.message.includes('schema cache') || error.message.includes('column'))) {
              throw new Error('Schema issue detected');
            }
            console.error(`PersistenceService - Erro ao atualizar step ${step.id}:`, error);
            throw error;
          }
          
          // Se tiver questions, também atualizar
          if (step.questions && step.questions.length > 0) {
            await this.persistQuestions(step.questions, step.id);
          }
          
          console.log(`PersistenceService - Step ${step.id} atualizado com sucesso`);
          return true;
        } else {
          // Criar novo step
          const { data: newStep, error } = await supabase
            .from('steps')
            .insert([{
              ...fullStepData,
              funnel_id: funnelId,
              created_at: formatDateForSupabase()
            }])
            .select()
            .single();
            
          if (error) {
            if (error.message && (error.message.includes('backButtonText') || error.message.includes('schema cache') || error.message.includes('column'))) {
              throw new Error('Schema issue detected');
            }
            console.error(`PersistenceService - Erro ao criar step:`, error);
            throw error;
          }
          
          // Se tiver questions e o step foi criado com sucesso, persistir
          if (newStep && step.questions && step.questions.length > 0) {
            await this.persistQuestions(step.questions, newStep.id);
          }
          
          console.log(`PersistenceService - Novo step criado com ID ${newStep.id}`);
          return true;
        }
      } catch (schemaError) {
        // Se o erro for relacionado ao schema, tentar apenas com os campos essenciais
        console.log(`PersistenceService - Detectado erro de schema, tentando apenas com campos essenciais:`, schemaError);
        
        if (step.id) {
          // Atualizar step existente com apenas os campos essenciais
          const { error } = await supabase
            .from('steps')
            .update(baseStepData)
            .eq('id', step.id);
            
          if (error) {
            console.error(`PersistenceService - Erro ao atualizar step com campos reduzidos:`, error);
            return false;
          }
          
          // Se tiver questions, também atualizar
          if (step.questions && step.questions.length > 0) {
            await this.persistQuestions(step.questions, step.id);
          }
          
          console.log(`PersistenceService - Step ${step.id} atualizado com sucesso (versão reduzida)`);
          return true;
        } else {
          // Criar novo step com apenas os campos essenciais
          const { data: newStep, error } = await supabase
            .from('steps')
            .insert([{
              ...baseStepData,
              funnel_id: funnelId,
              created_at: formatDateForSupabase()
            }])
            .select()
            .single();
            
          if (error) {
            console.error(`PersistenceService - Erro ao criar step com campos reduzidos:`, error);
            return false;
          }
          
          // Se tiver questions e o step foi criado com sucesso, persistir
          if (newStep && step.questions && step.questions.length > 0) {
            await this.persistQuestions(step.questions, newStep.id);
          }
          
          console.log(`PersistenceService - Novo step criado com ID ${newStep.id} (versão reduzida)`);
          return true;
        }
      }
    } catch (error) {
      console.error('PersistenceService - Erro ao persistir step:', error);
      return false;
    }
  },
  
  /**
   * Salva apenas as configurações do funil
   */
  async saveFunnelSettings(funnel: Funnel): Promise<PersistenceResult<Funnel>> {
    try {
      console.log('PersistenceService - Salvando configurações do funil:', funnel.id);
      
      // Verificar se temos logo e imprimir seu tamanho
      if (funnel.settings?.logo) {
        console.log('PersistenceService - Logo encontrado nas configurações, tamanho:', 
          funnel.settings.logo.length, 
          'tipo:', typeof funnel.settings.logo
        );
      } else {
        console.log('PersistenceService - Sem logo nas configurações');
      }
      
      // Extrair apenas os dados de configuração
      const settingsUpdate = {
        id: funnel.id,
        settings: funnel.settings,
        updated_at: formatDateForSupabase()
      };
      
      // Validar configurações
      if (!settingsUpdate.settings) {
        console.error('PersistenceService - Configurações inválidas');
        return {
          success: false,
          data: funnel,
          error: new Error('Configurações inválidas')
        };
      }
      
      // Persistir apenas as configurações
      const updatedFunnel = await funnelService.updateFunnel(funnel.id, settingsUpdate);
      console.log('PersistenceService - Configurações persistidas com sucesso');
      
      // Verificar se o logo foi preservado no funnel retornado
      if (funnel.settings?.logo && !updatedFunnel.settings?.logo) {
        console.error('PersistenceService - Logo perdido após persistência!');
      } else if (updatedFunnel.settings?.logo) {
        console.log('PersistenceService - Logo preservado no funil retornado');
      }
      
      // Buscar funil atualizado
      const { data: refreshedFunnel } = await supabase
        .from('funnels')
        .select(`
          *,
          steps (
            *,
            questions (*)
          )
        `)
        .eq('id', funnel.id)
        .single();
      
      if (refreshedFunnel) {
        console.log('PersistenceService - Configurações salvas com sucesso');
        return {
          success: true,
          data: refreshedFunnel
        };
      }
      
      // Fallback
      return {
        success: true,
        data: {
          ...updatedFunnel,
          steps: funnel.steps || []
        }
      };
    } catch (error) {
      console.error("PersistenceService - Erro ao salvar configurações:", error);
      return {
        success: false,
        error,
        data: funnel
      };
    }
  },
  
  /**
   * Validação básica dos dados do funil
   */
  validateFunnelBasic(funnel: any): boolean {
    // Verificar campos obrigatórios
    if (!funnel.id || typeof funnel.id !== 'string') {
      console.error('PersistenceService - ID do funil inválido');
      return false;
    }
    
    if (!funnel.name || typeof funnel.name !== 'string') {
      console.error('PersistenceService - Nome do funil inválido');
      return false;
    }
    
    // Verificar settings básicos
    if (!funnel.settings || typeof funnel.settings !== 'object') {
      console.error('PersistenceService - Settings do funil inválidos');
      return false;
    }
    
    return true;
  }
}; 