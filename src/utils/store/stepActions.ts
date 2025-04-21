import { persistenceService } from '@/services/persistenceService';
import { operationQueueService } from '@/services/operationQueueService';
import { supabase } from '@/lib/supabase';

/**
 * Gera um ID UUID com formato válido para o Supabase
 */
function generateValidUUID() {
  return crypto.randomUUID();
}

/**
 * Formata data ISO em formato compatível com Supabase
 */
function formatDateForSupabase() {
  return new Date().toISOString();
}

export const addStepAction = (set: any, get: any) => async () => {
  const { currentFunnel } = get();
  if (!currentFunnel) return;
  
  console.log("StepActions - Adicionando nova etapa ao funil", currentFunnel.id);
  
  // Criar novo ID para o step
  const newStepId = generateValidUUID();
  
  // Calcular o próximo order_index baseado no maior valor existente
  let nextOrderIndex = 0;
  if (currentFunnel.steps && currentFunnel.steps.length > 0) {
    let maxOrderIndex = 0;
    currentFunnel.steps.forEach(step => {
      const orderIndex = step.order_index ?? 0;
      if (orderIndex > maxOrderIndex) {
        maxOrderIndex = orderIndex;
      }
    });
    nextOrderIndex = maxOrderIndex + 1;
  }
  
  console.log(`StepActions - Usando order_index: ${nextOrderIndex} para nova etapa`);
  
  const newStep = {
    id: newStepId,
    title: `Step ${currentFunnel.steps.length + 1}`,
    questions: [],
    buttonText: 'Continue',
    canvasElements: [], // Garantir que inicie com array vazio
    funnel_id: currentFunnel.id, // Importante: adicionar referência ao funnel
    position: currentFunnel.steps.length, // Importante: guardar posição
    order_index: nextOrderIndex, // Definir order_index explicitamente
    created_at: formatDateForSupabase(),
    updated_at: formatDateForSupabase(),
  };
  
  // Clone profundo para evitar referências compartilhadas
  const funnelCopy = JSON.parse(JSON.stringify(currentFunnel));
  
  // Adicionar etapa ao array de etapas do funil
  const updatedFunnel = {
    ...funnelCopy,
    steps: [...funnelCopy.steps, newStep],
    updated_at: formatDateForSupabase(),
  };
  
  const newStepIndex = currentFunnel.steps.length;
  
  try {
    // Atualizar o estado local imediatamente para UI responsiva
    set((state) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      ),
      currentStep: newStepIndex,
    }));
    
    // MÉTODO 1: Persistir diretamente no Supabase para garantir sucesso imediato
    try {
      console.log("StepActions - Persistindo nova etapa diretamente no Supabase");
      
      // Simplificando para apenas campos essenciais
      const stepToCreate = {
        id: newStepId,
        title: newStep.title,
        funnel_id: currentFunnel.id,
        order_index: nextOrderIndex, // Usar o mesmo valor que no objeto newStep
        created_at: formatDateForSupabase(),
        updated_at: formatDateForSupabase()
      };
      
      console.log("StepActions - Dados enviados para o Supabase:", JSON.stringify(stepToCreate, null, 2));
      
      // Criar step diretamente no Supabase
      const { data, error } = await supabase
        .from('steps')
        .insert(stepToCreate)
        .select();
      
      if (error) {
        console.error("StepActions - Erro ao inserir etapa diretamente:", error);
        console.error("StepActions - Detalhes do erro:", JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log("StepActions - Etapa persistida com sucesso diretamente:", data);
    } 
    // MÉTODO 2: Usar persistenceService como fallback
    catch (directError) {
      console.error("StepActions - Erro na persistência direta, tentando via persistenceService:", directError);
      
      try {
        const result = await persistenceService._saveAllFunnelData(updatedFunnel);
        
        if (!result.success) {
          throw new Error(`Falha ao salvar etapa: ${result.error}`);
        }
        
        console.log("StepActions - Etapa persistida com sucesso via persistenceService");
        
        // Atualizar o estado com os dados mais recentes do servidor
        set((state) => ({
          funnels: state.funnels.map((funnel) => 
            funnel.id === result.data.id ? result.data : funnel
          ),
          currentFunnel: state.currentFunnel?.id === result.data.id ? result.data : state.currentFunnel
        }));
      } 
      // MÉTODO 3: Enfileirar operação como último recurso
      catch (persistError) {
        console.error("StepActions - Erro via persistenceService, enfileirando:", persistError);
        
        operationQueueService.enqueue(
          async (funnelData) => {
            const retryResult = await persistenceService.saveFunnel(funnelData);
            if (!retryResult.success) {
              throw new Error(`Falha ao salvar etapa: ${retryResult.error}`);
            }
            return retryResult.data;
          },
          updatedFunnel,
          {
            maxAttempts: 5, // Aumentar tentativas por ser crítico
            description: `Salvar nova etapa no funil ${currentFunnel.id} (fallback)`,
            onSuccess: (savedFunnel) => {
              console.log("StepActions - Etapa persistida com sucesso (fallback)");
              set((state) => ({
                funnels: state.funnels.map((funnel) => 
                  funnel.id === savedFunnel.id ? savedFunnel : funnel
                ),
                currentFunnel: state.currentFunnel?.id === savedFunnel.id ? savedFunnel : state.currentFunnel
              }));
            },
            onError: (error) => {
              console.error("StepActions - Erro ao persistir etapa (fallback):", error);
            }
          }
        );
      }
    }
    
    // Retornar a etapa adicionada para referência
    return {
      step: newStep,
      index: newStepIndex
    };
  } catch (error) {
    console.error("Error adding step:", error);
    throw error;
  }
};

export const updateStepAction = (set: any, get: any) => (stepId: string, stepUpdates: any) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return;
  
  // Encontrar o índice da etapa
  const stepIndex = currentFunnel.steps.findIndex(step => step.id === stepId);
  if (stepIndex === -1) {
    console.error(`StepActions - Etapa não encontrada: ${stepId}`);
    return;
  }
  
  // Criar cópia profunda do funnel atual
  const funnelCopy = JSON.parse(JSON.stringify(currentFunnel));
  
  // Atualizar a etapa específica
  const updatedSteps = funnelCopy.steps.map((step) => 
    step.id === stepId ? { 
      ...step, 
      ...stepUpdates,
      updated_at: formatDateForSupabase()
    } : step
  );
  
  // Criar o funil atualizado
  const updatedFunnel = {
    ...funnelCopy,
    steps: updatedSteps,
    updated_at: formatDateForSupabase(),
  };
  
  // Atualizar o estado local imediatamente para UI responsiva
  set((state) => ({
    currentFunnel: updatedFunnel,
    funnels: state.funnels.map((funnel) => 
      funnel.id === currentFunnel.id ? updatedFunnel : funnel
    ),
  }));
  
  // MÉTODO 1: Tentar atualizar diretamente no Supabase
  try {
    // Encontrar o step atualizado
    const updatedStep = updatedSteps.find(s => s.id === stepId);
    if (!updatedStep) throw new Error("Step não encontrado após atualização");
    
    // Campos seguros para atualização
    const stepToUpdate: {
      title: any;
      order_index?: number;
      updated_at: string;
    } = {
      title: updatedStep.title,
      updated_at: formatDateForSupabase()
    };
    
    // Definir order_index apenas se tivermos o valor
    if (updatedStep.position !== undefined) {
      stepToUpdate.order_index = updatedStep.position;
    }
    
    console.log(`StepActions - Atualizando step ${stepId} com dados:`, JSON.stringify(stepToUpdate, null, 2));
    
    // Executar atualização direta no Supabase e lidar com erros
    (async () => {
      try {
        const { error } = await supabase
          .from('steps')
          .update(stepToUpdate)
          .eq('id', stepId);
          
        if (error) {
          console.error(`StepActions - Erro ao atualizar step ${stepId} diretamente:`, error);
          throw error;
        }
        console.log(`StepActions - Step ${stepId} atualizado com sucesso diretamente`);
      } catch (error) {
        // Fallback para persistenceService se falhar
        console.error(`StepActions - Erro na atualização direta, usando persistenceService:`, error);
        
        // Persistir no Supabase usando persistenceService
        operationQueueService.enqueue(
          async (funnelData) => {
            const result = await persistenceService.saveFunnel(funnelData);
            
            if (!result.success) {
              throw new Error(`Falha ao atualizar etapa: ${result.error}`);
            }
            
            return result.data;
          },
          updatedFunnel,
          {
            maxAttempts: 3,
            description: `Atualizar etapa ${stepId} no funil ${currentFunnel.id}`,
            onSuccess: (savedFunnel) => {
              console.log("StepActions - Etapa atualizada persistida com sucesso");
            },
            onError: (error) => {
              console.error(`StepActions - Erro ao persistir atualização da etapa ${stepId}:`, error);
            }
          }
        );
      }
    })();
  } catch (error) {
    console.error(`StepActions - Erro ao atualizar step ${stepId}:`, error);
    
    // Fallback para persistenceService
    operationQueueService.enqueue(
      async (funnelData) => {
        const result = await persistenceService.saveFunnel(funnelData);
        
        if (!result.success) {
          throw new Error(`Falha ao atualizar etapa: ${result.error}`);
        }
        
        return result.data;
      },
      updatedFunnel,
      {
        maxAttempts: 3,
        description: `Atualizar etapa ${stepId} no funil ${currentFunnel.id}`,
        onSuccess: (savedFunnel) => {
          console.log("StepActions - Etapa atualizada persistida com sucesso");
        },
        onError: (error) => {
          console.error(`StepActions - Erro ao persistir atualização da etapa ${stepId}:`, error);
        }
      }
    );
  }
};

export const deleteStepAction = (set: any, get: any) => async (stepIndex: number) => {
  const { currentFunnel, currentStep } = get();
  if (!currentFunnel || currentFunnel.steps.length <= 1) {
    console.error('Cannot delete step: no current funnel or only one step remains');
    return;
  }
  
  // Log detalhado do estado atual antes da exclusão
  console.log(`StepActions - Etapas antes da exclusão:`, currentFunnel.steps.map((s, i) => `${i}: ${s.title} (${s.id})`));
  console.log(`StepActions - Tentando excluir a etapa no índice: ${stepIndex}`);
  console.log(`StepActions - Etapa atual: ${currentStep}`);
  
  // Validar se o índice está dentro dos limites válidos
  if (stepIndex < 0 || stepIndex >= currentFunnel.steps.length) {
    console.error(`Invalid step index: ${stepIndex}, steps length: ${currentFunnel.steps.length}`);
    return;
  }
  
  // Obter a etapa a ser excluída para registro
  const stepToDelete = currentFunnel.steps[stepIndex];
  console.log(`StepActions - Excluindo etapa no índice: ${stepIndex}, ID: ${stepToDelete.id}, título: ${stepToDelete.title}`);
  
  // Criar uma cópia profunda do funil
  const funnelCopy = JSON.parse(JSON.stringify(currentFunnel));
  
  // Criar uma cópia do array de etapas
  const updatedSteps = [...funnelCopy.steps];
  
  // Remover a etapa do índice fornecido
  updatedSteps.splice(stepIndex, 1);
  
  // Atualizar as posições de todas as etapas para garantir ordem correta
  updatedSteps.forEach((step, idx) => {
    step.position = idx;
    
    // Atualizar também o order_index para garantir a ordem correta
    // Use o valor original quando disponível ou atualize com base na posição
    if (step.order_index !== undefined) {
      // Ajustar order_index apenas para steps que vinham depois do deletado
      const originalStepIndex = funnelCopy.steps.findIndex(s => s.id === step.id);
      if (originalStepIndex > stepIndex) {
        step.order_index = step.order_index - 1;
      }
    } else {
      step.order_index = idx;
    }
    
    step.updated_at = formatDateForSupabase();
  });
  
  console.log(`StepActions - Etapas após a exclusão:`, updatedSteps.map((s, i) => `${i}: ${s.title} (${s.id})`));
  
  // Criar o funil atualizado
  const updatedFunnel = {
    ...funnelCopy,
    steps: updatedSteps,
    updated_at: formatDateForSupabase(),
  };
  
  // Calcular o novo índice da etapa atual
  let newCurrentStep = currentStep;
  
  // Se excluímos a etapa atualmente selecionada
  if (stepIndex === currentStep) {
    // Ir para a etapa anterior, ou se estivermos na primeira etapa, ir para a próxima
    newCurrentStep = Math.max(0, Math.min(stepIndex, updatedSteps.length - 1));
    console.log(`StepActions - Excluímos a etapa atual ${currentStep}, nova etapa atual: ${newCurrentStep}`);
  } 
  // Se excluímos uma etapa antes da atual, ajustar o índice
  else if (stepIndex < currentStep) {
    newCurrentStep = currentStep - 1;
    console.log(`StepActions - Excluímos uma etapa antes da atual, ajustando de ${currentStep} para ${newCurrentStep}`);
  }
  
  try {
    // Atualizar o estado local imediatamente para UI responsiva
    set((state) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      ),
      currentStep: newCurrentStep,
    }));
    
    // MÉTODO 1: Excluir diretamente no Supabase
    try {
      console.log(`StepActions - Excluindo etapa ${stepToDelete.id} diretamente no Supabase`);
      
      const { error } = await supabase
        .from('steps')
        .delete()
        .eq('id', stepToDelete.id);
        
      if (error) {
        console.error(`StepActions - Erro ao excluir step ${stepToDelete.id} diretamente:`, error);
        throw error;
      }
      
      console.log(`StepActions - Step ${stepToDelete.id} excluído com sucesso diretamente`);
    }
    // MÉTODO 2: Fallback via persistenceService
    catch (directError) {
      console.error(`StepActions - Erro na exclusão direta, usando persistenceService:`, directError);
      
      // Persistir no Supabase usando persistenceService
      operationQueueService.enqueue(
        async (funnelData) => {
          const result = await persistenceService.saveFunnel(funnelData);
          
          if (!result.success) {
            throw new Error(`Falha ao excluir etapa: ${result.error}`);
          }
          
          return result.data;
        },
        updatedFunnel,
        {
          maxAttempts: 3,
          description: `Excluir etapa ${stepToDelete.id} no funil ${currentFunnel.id}`,
          onSuccess: (savedFunnel) => {
            console.log("StepActions - Exclusão de etapa persistida com sucesso");
          },
          onError: (error) => {
            console.error(`StepActions - Erro ao persistir exclusão da etapa:`, error);
          }
        }
      );
    }
    
    console.log(`StepActions - Exclusão concluída, etapa atual agora: ${newCurrentStep}`);
    
    return true;
  } catch (error) {
    console.error("Error deleting step:", error);
    throw error;
  }
};

export const setCurrentStepAction = (set: any, get: any) => (stepIndex: number) => {
  // Evitar mudar para um índice inválido
  const { currentFunnel } = get();
  if (currentFunnel && (stepIndex < 0 || stepIndex >= currentFunnel.steps.length)) {
    console.error(`Store - Invalid step index: ${stepIndex}`);
    return;
  }
  
  set({ currentStep: stepIndex });
  console.log(`Store - Current step set to: ${stepIndex}`);
};

export const duplicateStepAction = (set: any, get: any) => async () => {
  const { currentFunnel, currentStep } = get();
  if (!currentFunnel) return;
  
  // Get the step to duplicate
  const stepToDuplicate = currentFunnel.steps[currentStep];
  console.log(`StepActions - Duplicating step: ${stepToDuplicate.id}, title: ${stepToDuplicate.title}`);
  
  // Create a deep copy of the step to duplicate
  const stepCopy = JSON.parse(JSON.stringify(stepToDuplicate));
  
  // Generate new IDs for the step and its questions
  const newStepId = generateValidUUID();
  
  // Calculate the next order_index
  let nextOrderIndex = 0;
  if (currentFunnel.steps && currentFunnel.steps.length > 0) {
    let maxOrderIndex = 0;
    currentFunnel.steps.forEach(step => {
      const orderIndex = step.order_index ?? 0;
      if (orderIndex > maxOrderIndex) {
        maxOrderIndex = orderIndex;
      }
    });
    nextOrderIndex = maxOrderIndex + 1;
  }
  
  // Create the new duplicate step
  const duplicateStep = {
    ...stepCopy,
    id: newStepId,
    title: `${stepCopy.title} (Copy)`,
    funnel_id: currentFunnel.id,
    position: currentStep + 1, // Insert after the current step
    order_index: nextOrderIndex,
    created_at: formatDateForSupabase(),
    updated_at: formatDateForSupabase(),
  };
  
  // Create new IDs for all questions
  if (duplicateStep.questions && duplicateStep.questions.length > 0) {
    duplicateStep.questions = duplicateStep.questions.map(question => ({
      ...question,
      id: generateValidUUID(),
      step_id: newStepId,
      created_at: formatDateForSupabase(),
      updated_at: formatDateForSupabase(),
    }));
  }
  
  // Create a deep copy of the funnel
  const funnelCopy = JSON.parse(JSON.stringify(currentFunnel));
  
  // Create a copy of steps array
  const updatedSteps = [...funnelCopy.steps];
  
  // Insert the duplicated step after the current step
  updatedSteps.splice(currentStep + 1, 0, duplicateStep);
  
  // Update the positions of all steps after the inserted one
  updatedSteps.forEach((step, idx) => {
    step.position = idx;
    
    // Make sure all steps have an order_index
    if (step.order_index === undefined) {
      step.order_index = idx;
    }
    
    step.updated_at = formatDateForSupabase();
  });
  
  // Create the updated funnel
  const updatedFunnel = {
    ...funnelCopy,
    steps: updatedSteps,
    updated_at: formatDateForSupabase(),
  };
  
  try {
    // Update the state immediately for responsive UI
    set((state) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      ),
      currentStep: currentStep + 1, // Switch to the new duplicated step
    }));
    
    // MÉTODO 1: Persist directly to Supabase
    try {
      console.log("StepActions - Persisting duplicated step directly to Supabase");
      
      // Essential fields for step creation
      const stepToCreate = {
        id: newStepId,
        title: duplicateStep.title,
        funnel_id: currentFunnel.id,
        buttonText: duplicateStep.buttonText,
        canvasElements: duplicateStep.canvasElements,
        order_index: nextOrderIndex,
        created_at: formatDateForSupabase(),
        updated_at: formatDateForSupabase()
      };
      
      console.log("StepActions - Data sent to Supabase:", JSON.stringify(stepToCreate, null, 2));
      
      // Create step directly in Supabase
      const { data, error } = await supabase
        .from('steps')
        .insert(stepToCreate)
        .select();
      
      if (error) {
        console.error("StepActions - Error inserting duplicated step:", error);
        console.error("StepActions - Error details:", JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log("StepActions - Step duplicated successfully:", data);
      
      // If the step has questions, create them too
      if (duplicateStep.questions && duplicateStep.questions.length > 0) {
        const questionsToCreate = duplicateStep.questions.map(question => ({
          id: question.id,
          type: question.type,
          title: question.title,
          description: question.description,
          options: question.options,
          required: question.required,
          configuration: question.configuration,
          step_id: newStepId,
          created_at: question.created_at,
          updated_at: question.updated_at
        }));
        
        console.log(`StepActions - Creating ${questionsToCreate.length} questions for duplicated step`);
        
        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToCreate);
          
        if (questionsError) {
          console.error("StepActions - Error inserting questions:", questionsError);
          throw questionsError;
        }
        
        console.log("StepActions - Questions duplicated successfully");
      }
    } 
    // MÉTODO 2: Use persistenceService as fallback
    catch (directError) {
      console.error("StepActions - Error in direct persistence, trying via persistenceService:", directError);
      
      try {
        const result = await persistenceService._saveAllFunnelData(updatedFunnel);
        
        if (!result.success) {
          throw new Error(`Failed to save duplicated step: ${result.error}`);
        }
        
        console.log("StepActions - Step duplicated and persisted successfully via persistenceService");
        
        // Update state with latest data from server
        set((state) => ({
          funnels: state.funnels.map((funnel) => 
            funnel.id === result.data.id ? result.data : funnel
          ),
          currentFunnel: state.currentFunnel?.id === result.data.id ? result.data : state.currentFunnel
        }));
      } 
      // MÉTODO 3: Queue operation as last resort
      catch (persistError) {
        console.error("StepActions - Error via persistenceService, queueing:", persistError);
        
        operationQueueService.enqueue(
          async (funnelData) => {
            const retryResult = await persistenceService.saveFunnel(funnelData);
            if (!retryResult.success) {
              throw new Error(`Failed to save duplicated step: ${retryResult.error}`);
            }
            return retryResult.data;
          },
          updatedFunnel,
          {
            maxAttempts: 5,
            description: `Save duplicated step in funnel ${currentFunnel.id} (fallback)`,
            onSuccess: (savedFunnel) => {
              console.log("StepActions - Duplicated step persisted successfully (fallback)");
              set((state) => ({
                funnels: state.funnels.map((funnel) => 
                  funnel.id === savedFunnel.id ? savedFunnel : funnel
                ),
                currentFunnel: state.currentFunnel?.id === savedFunnel.id ? savedFunnel : state.currentFunnel
              }));
            },
            onError: (error) => {
              console.error("StepActions - Error persisting duplicated step (fallback):", error);
            }
          }
        );
      }
    }
    
    return {
      step: duplicateStep,
      index: currentStep + 1
    };
  } catch (error) {
    console.error("Error duplicating step:", error);
    throw error;
  }
};
