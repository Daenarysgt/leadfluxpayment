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

export const duplicateStepAction = (set: any, get: any) => async (stepIndex: number) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return;
  
  // Verificar se o índice está dentro dos limites válidos
  if (stepIndex < 0 || stepIndex >= currentFunnel.steps.length) {
    console.error(`Invalid step index for duplication: ${stepIndex}`);
    return;
  }
  
  console.log(`StepActions - Duplicando etapa no índice: ${stepIndex}`);
  
  // Obter a etapa a ser duplicada
  const stepToDuplicate = currentFunnel.steps[stepIndex];
  
  // Criar clone profundo da etapa para evitar referências compartilhadas
  const stepClone = JSON.parse(JSON.stringify(stepToDuplicate));
  
  // Gerar novo ID para a etapa duplicada
  const newStepId = generateValidUUID();
  
  // Clone profundo do funnel atual
  const funnelCopy = JSON.parse(JSON.stringify(currentFunnel));
  
  // ABORDAGEM SIMPLIFICADA: Ordene as etapas por position primeiro
  const orderedByPosition = [...funnelCopy.steps].sort((a, b) => 
    (a.position ?? 0) - (b.position ?? 0)
  );
  
  // Encontre a posição visual da etapa atual
  const currentVisualPosition = orderedByPosition.findIndex(s => s.id === stepToDuplicate.id);
  
  // SEMPRE inserir a etapa duplicada logo após a original, na posição visual + 1
  // Isso é muito mais previsível que usar order_index
  const duplicatedStep = {
    ...stepClone,
    id: newStepId,
    title: `${stepToDuplicate.title} (cópia)`,
    position: currentVisualPosition + 1, // Posição visual + 1
    created_at: formatDateForSupabase(),
    updated_at: formatDateForSupabase(),
  };
  
  // Inserir na posição visual + 1 (logo após a original)
  orderedByPosition.splice(currentVisualPosition + 1, 0, duplicatedStep);
  
  // Reindexar todas as posições para garantir consistência
  orderedByPosition.forEach((step, idx) => {
    step.position = idx;
    // Atualizar order_index para corresponder à posição visual
    step.order_index = idx * 10;
  });
  
  // Atualizar o funnel com as etapas reordenadas
  const updatedFunnel = {
    ...funnelCopy,
    steps: orderedByPosition,
    updated_at: formatDateForSupabase(),
  };
  
  // O novo índice atual é SEMPRE a posição visual + 1
  const newStepIndex = currentVisualPosition + 1;
  
  try {
    // Atualizar o estado local imediatamente para UI responsiva
    set((state) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      ),
      currentStep: newStepIndex, // Alternar para a etapa duplicada
    }));
    
    // MÉTODO 1: Persistir diretamente no Supabase
    try {
      console.log("StepActions - Persistindo etapa duplicada diretamente no Supabase");
      
      // Simplificar para campos essenciais
      const stepToCreate = {
        id: newStepId,
        title: duplicatedStep.title,
        funnel_id: currentFunnel.id,
        order_index: duplicatedStep.order_index,
        position: duplicatedStep.position,
        created_at: formatDateForSupabase(),
        updated_at: formatDateForSupabase()
      };
      
      // Inserir a nova etapa no Supabase
      const { data, error } = await supabase
        .from('steps')
        .insert(stepToCreate)
        .select();
      
      if (error) {
        console.error("StepActions - Erro ao inserir etapa duplicada:", error);
        throw error;
      }
      
      console.log("StepActions - Etapa duplicada persistida com sucesso");
      
      // Após criar o step, duplicar os elementos de canvas se existirem
      if (stepToDuplicate.canvasElements && stepToDuplicate.canvasElements.length > 0) {
        // Clone os elementos com novos IDs
        const canvasElementsToInsert = stepToDuplicate.canvasElements.map(element => ({
          ...element,
          id: generateValidUUID(),
          step_id: newStepId,
          created_at: formatDateForSupabase(),
          updated_at: formatDateForSupabase()
        }));
        
        // Inserir elementos de canvas duplicados
        const { error: canvasError } = await supabase
          .from('canvas_elements')
          .insert(canvasElementsToInsert);
          
        if (canvasError) {
          console.error("StepActions - Erro ao duplicar elementos de canvas:", canvasError);
        } else {
          console.log("StepActions - Elementos de canvas duplicados com sucesso");
        }
      }
      
      // IMPORTANTE: Atualizar TODAS as etapas para garantir posições e order_index consistentes
      const updates = orderedByPosition
        .filter(step => step.id !== newStepId) // Excluir a etapa recém-criada que já foi inserida
        .map(step => ({
          id: step.id,
          position: step.position,
          order_index: step.order_index,
          updated_at: formatDateForSupabase()
        }));
      
      if (updates.length > 0) {
        console.log("Atualizando posições de todas as etapas:", 
          updates.map(u => `${u.id}: position=${u.position}, order=${u.order_index}`).join(', '));
        
        const { error: updateError } = await supabase
          .from('steps')
          .upsert(updates);
          
        if (updateError) {
          console.error("StepActions - Erro ao atualizar posições das etapas:", updateError);
        } else {
          console.log("StepActions - Posições das etapas atualizadas com sucesso");
        }
      }
    } 
    // MÉTODO 2: Fallback para persistenceService
    catch (directError) {
      console.error("StepActions - Erro na persistência direta, usando persistenceService:", directError);
      
      // Persistir via persistenceService
      operationQueueService.enqueue(
        async (funnelData) => {
          const result = await persistenceService._saveAllFunnelData(funnelData);
          
          if (!result.success) {
            throw new Error(`Falha ao duplicar etapa: ${result.error}`);
          }
          
          return result.data;
        },
        updatedFunnel,
        {
          maxAttempts: 3,
          description: `Duplicar etapa no funil ${currentFunnel.id}`,
          onSuccess: (savedFunnel) => {
            console.log("StepActions - Etapa duplicada persistida com sucesso (fallback)");
            
            // Atualizar o estado com os dados mais recentes do servidor
            set((state) => ({
              funnels: state.funnels.map((funnel) => 
                funnel.id === savedFunnel.id ? savedFunnel : funnel
              ),
              currentFunnel: state.currentFunnel?.id === savedFunnel.id ? savedFunnel : state.currentFunnel
            }));
          },
          onError: (error) => {
            console.error("StepActions - Erro ao persistir etapa duplicada:", error);
          }
        }
      );
    }
    
    // Retornar a etapa duplicada para referência
    return {
      step: duplicatedStep,
      index: newStepIndex
    };
  } catch (error) {
    console.error("Error duplicating step:", error);
    throw error;
  }
};

// Função auxiliar para normalizar os order_index de todas as etapas
// Isso garante que todas as etapas tenham order_index sequenciais sem buracos
async function normalizeStepOrderIndexes(funnelId: string) {
  try {
    // Buscar todas as etapas do funil
    const { data: steps, error } = await supabase
      .from('steps')
      .select('id, title, order_index, position')
      .eq('funnel_id', funnelId)
      .order('order_index');
    
    if (error) {
      console.error("Erro ao buscar etapas para normalização:", error);
      return;
    }
    
    // Se não há etapas para normalizar, retornar
    if (!steps || steps.length === 0) return;
    
    console.log("Normalizando order_index das etapas:", 
      steps.map(s => `${s.title} (${s.id}): order=${s.order_index}, pos=${s.position}`).join(', '));
    
    // Ordenar as etapas primeiro para garantir consistência
    const sortedSteps = [...steps].sort((a, b) => {
      const orderA = a.order_index ?? 0;
      const orderB = b.order_index ?? 0;
      
      // Se os order_index são iguais, ordenar por posição para consistência
      if (orderA === orderB) {
        const posA = a.position ?? 0;
        const posB = b.position ?? 0;
        if (posA !== posB) {
          return posA - posB;
        }
        return a.id.localeCompare(b.id); // Última opção: ordenar por ID
      }
      
      return orderA - orderB;
    });
    
    // Criar um lote de atualizações para evitar múltiplas chamadas
    const updates = sortedSteps.map((step, index) => ({
      id: step.id,
      order_index: (index + 1) * 10, // Usar múltiplos de 10 para permitir inserções futuras
      position: index, // Atualizar também a posição para refletir a ordem atual
      updated_at: formatDateForSupabase()
    }));
    
    console.log("Order_index normalizados:", 
      updates.map(u => `${u.id}: order=${u.order_index}, pos=${u.position}`).join(', '));
    
    // Atualizar todas as etapas com novos order_index
    const { error: updateError } = await supabase
      .from('steps')
      .upsert(updates);
    
    if (updateError) {
      console.error("Erro ao normalizar order_index das etapas:", updateError);
    } else {
      console.log("Order_index das etapas normalizado com sucesso");
    }
  } catch (error) {
    console.error("Erro ao normalizar order_index das etapas:", error);
  }
}

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

export const reorderStepsAction = (set: any, get: any) => async (sourceIndex: number, destinationIndex: number) => {
  const { currentFunnel, currentStep } = get();
  if (!currentFunnel) return;
  
  // Validar os índices
  if (sourceIndex < 0 || sourceIndex >= currentFunnel.steps.length || 
      destinationIndex < 0 || destinationIndex >= currentFunnel.steps.length) {
    console.error(`Índices inválidos para reordenação: ${sourceIndex} -> ${destinationIndex}`);
    return;
  }
  
  console.log(`StepActions - Reordenando etapa: ${sourceIndex} -> ${destinationIndex}`);
  
  // Criar uma cópia profunda do funnel e das etapas
  const funnelCopy = JSON.parse(JSON.stringify(currentFunnel));
  const updatedSteps = [...funnelCopy.steps];
  
  // Remover a etapa da posição atual
  const [removedStep] = updatedSteps.splice(sourceIndex, 1);
  
  // Inserir a etapa na nova posição
  updatedSteps.splice(destinationIndex, 0, removedStep);
  
  // Atualizar as posições e order_index
  updatedSteps.forEach((step, index) => {
    step.position = index;
    step.order_index = index * 10; // Usar múltiplos de 10 para facilitar inserções futuras
    step.updated_at = formatDateForSupabase();
  });
  
  // Atualizar o funnel
  const updatedFunnel = {
    ...funnelCopy,
    steps: updatedSteps,
    updated_at: formatDateForSupabase(),
  };
  
  // Calcular o novo índice atual
  let newCurrentStep = currentStep;
  
  // Se movemos a etapa atual
  if (sourceIndex === currentStep) {
    newCurrentStep = destinationIndex;
  } 
  // Se movemos uma etapa de uma posição antes da atual para uma posição depois
  else if (sourceIndex < currentStep && destinationIndex >= currentStep) {
    newCurrentStep = currentStep - 1;
  } 
  // Se movemos uma etapa de uma posição depois da atual para uma posição antes
  else if (sourceIndex > currentStep && destinationIndex <= currentStep) {
    newCurrentStep = currentStep + 1;
  }
  
  try {
    // Atualizar o estado local imediatamente
    set((state) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      ),
      currentStep: newCurrentStep
    }));
    
    // Persistir no Supabase
    try {
      // Criar um lote de atualizações para os order_index
      const updates = updatedSteps.map(step => ({
        id: step.id,
        order_index: step.order_index,
        position: step.position,
        updated_at: formatDateForSupabase()
      }));
      
      // Atualizar todas as etapas com novos order_index
      const { error } = await supabase
        .from('steps')
        .upsert(updates);
      
      if (error) {
        console.error(`Erro ao atualizar order_index após reordenação:`, error);
        throw error;
      }
      
      console.log(`Order_index das etapas atualizado com sucesso após reordenação`);
    } catch (error) {
      console.error(`Erro ao persistir reordenação:`, error);
      
      // Fallback para persistenceService
      operationQueueService.enqueue(
        async (funnelData) => {
          const result = await persistenceService.saveFunnel(funnelData);
          
          if (!result.success) {
            throw new Error(`Falha ao reordenar etapas: ${result.error}`);
          }
          
          return result.data;
        },
        updatedFunnel,
        {
          maxAttempts: 3,
          description: `Reordenar etapas no funil ${currentFunnel.id}`,
          onSuccess: (savedFunnel) => {
            console.log("StepActions - Reordenação persistida com sucesso (fallback)");
          },
          onError: (error) => {
            console.error(`StepActions - Erro ao persistir reordenação:`, error);
          }
        }
      );
    }
    
    return { updatedFunnel, newCurrentStep };
  } catch (error) {
    console.error("Erro ao reordenar etapas:", error);
    throw error;
  }
};