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

export const duplicateStepAction = (set: any, get: any) => async (stepIndex: number) => {
  const { currentFunnel, setCanvasElements, getCanvasElements } = get();
  
  if (!currentFunnel || !currentFunnel.steps || currentFunnel.steps.length === 0) {
    console.error('Não é possível duplicar: funil não encontrado ou sem etapas');
    return;
  }
  
  if (stepIndex < 0 || stepIndex >= currentFunnel.steps.length) {
    console.error(`Índice de step inválido para duplicação: ${stepIndex}`);
    return;
  }
  
  try {
    console.log(`StepActions - Iniciando duplicação da etapa no índice ${stepIndex}`);
    
    // Obter o step a ser duplicado
    const stepToClone = currentFunnel.steps[stepIndex];
    console.log(`StepActions - Duplicando etapa "${stepToClone.title}" (ID: ${stepToClone.id})`);
    
    // MODIFICAÇÃO 1: Garantir que os elementos do canvas do step original estejam persistidos antes de duplicar
    console.log(`StepActions - Garantindo persistência dos elementos do step original antes da duplicação`);
    
    // 1. Verificar se o step original tem elementos no state
    const hasElementsInState = stepToClone.canvasElements && 
                              Array.isArray(stepToClone.canvasElements) && 
                              stepToClone.canvasElements.length > 0;
    
    if (hasElementsInState) {
      console.log(`StepActions - Step original tem ${stepToClone.canvasElements.length} elementos no state, persistindo...`);
      // Forçar persistência dos elementos do step original no banco
      try {
        await setCanvasElements(stepToClone.id, stepToClone.canvasElements);
        console.log(`StepActions - Elementos do step original persistidos com sucesso`);
        // Aguardar um momento para garantir consistência no banco
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (persistError) {
        console.error(`StepActions - Erro ao persistir elementos do step original:`, persistError);
        // Continuar com os elementos do state como fallback
      }
    }
    
    // Encontrar o order_index dos steps existentes
    const orderIndices = currentFunnel.steps
      .map(step => step.order_index ?? 0)
      .sort((a, b) => a - b);
    
    // Encontrar o próximo order_index após o step atual
    const currentOrderIndex = stepToClone.order_index ?? 0;
    let nextOrderIndex = currentOrderIndex + 1;
    console.log(`StepActions - Order_index original: ${currentOrderIndex}, novo: ${nextOrderIndex}`);
    
    // Incrementar o order_index de todos os steps com index >= nextOrderIndex
    const updatedSteps = currentFunnel.steps.map(step => {
      const stepOrderIndex = step.order_index ?? 0;
      if (stepOrderIndex >= nextOrderIndex) {
        return {
          ...step,
          order_index: stepOrderIndex + 1
        };
      }
      return step;
    });
    
    // Gerar novos IDs para todas as perguntas e suas opções
    const questionsWithNewIds = stepToClone.questions?.map(question => {
      // Gerar novo ID para a pergunta
      const newQuestionId = generateValidUUID();
      
      // Clonar as opções da pergunta, se existirem
      const optionsWithNewIds = question.options?.map(option => ({
        ...option,
        id: generateValidUUID() // Nova ID para cada opção
      })) || [];
      
      // Retornar a pergunta com novo ID e opções com novos IDs
      return {
        ...question,
        id: newQuestionId,
        options: optionsWithNewIds
      };
    }) || [];
    
    // Criar o novo step duplicado
    const newStepId = generateValidUUID();
    const now = formatDateForSupabase();
    const newStep = {
      ...stepToClone,
      id: newStepId,
      title: `${stepToClone.title} (cópia)`,
      questions: questionsWithNewIds,
      order_index: nextOrderIndex,
      position: stepIndex + 1, // Definir posição logo após o step original
      created_at: now,
      updated_at: now,
      canvasElements: [] // Inicializar um array vazio para canvasElements
    };
    
    console.log(`StepActions - Criado novo step com ID ${newStepId}`);
    
    // Inserir o novo step na coleção local primeiro para atualização imediata da UI
    const updatedFunnel = {
      ...currentFunnel,
      steps: [...updatedSteps, newStep],
      updated_at: now
    };

    // Ordenar os steps pelo order_index
    updatedFunnel.steps.sort((a, b) => {
      const aIndex = a.order_index ?? 0;
      const bIndex = b.order_index ?? 0;
      return aIndex - bIndex;
    });
    
    // Atualizar o estado local primeiro para interface responsiva
    set((state) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      )
    }));
    
    console.log(`StepActions - Estado local atualizado para UI responsiva`);
    
    // Preparar dados para persistência no Supabase (sem os canvas_elements)
    const stepToCreate = {
      id: newStepId,
        title: newStep.title,
        button_text: stepToClone.buttonText || 'Continuar',
        back_button_text: stepToClone.backButtonText || 'Voltar',
        show_progress_bar: stepToClone.showProgressBar !== undefined ? stepToClone.showProgressBar : true,
        order_index: nextOrderIndex,
        funnel_id: currentFunnel.id,
      created_at: now,
      updated_at: now
    };
    
    console.log(`StepActions - Iniciando persistência no Supabase`);
    
    // Criar uma promise para resolver apenas quando todas as operações estiverem concluídas
    const persistAll = async () => {
      try {
        // 1. Primeiro, inserir apenas o step na tabela steps
        const { data: newStepData, error } = await supabase
          .from('steps')
          .insert([stepToCreate])
          .select()
          .single();
    
        if (error) {
          console.error(`StepActions - Erro ao criar step duplicado no banco:`, error);
          throw error;
        }
    
        // Garantir que newStepData é um objeto com id
        const stepData = newStepData as { id: string };
        console.log(`StepActions - Step duplicado com sucesso no Supabase:`, stepData.id);
        
        // 2. Depois, buscar os elementos do canvas da etapa original
        console.log(`StepActions - Buscando elementos do canvas da etapa original (ID: ${stepToClone.id})`);
        
        let canvasElementsArray = [];
        try {
          // MODIFICAÇÃO 2: Estratégia dupla - primeiro tentar buscar do banco, depois usar state como fallback
          
          // 2.1 Tentar buscar elementos do canvas na tabela canvas_elements
          const { data: elementsFromDB, error: fetchError } = await supabase
            .from('canvas_elements')
            .select('*')
            .eq('step_id', stepToClone.id);
          
          if (fetchError) {
            console.error(`StepActions - Erro ao buscar elementos do canvas da etapa original:`, fetchError);
            throw fetchError;
          }
          
          let elementsCount = elementsFromDB?.length || 0;
          console.log(`StepActions - Retrieved ${elementsCount} canvas elements for step ${stepToClone.id} from database`);
          
          // Preparar array de elementos para clonagem (do banco ou do state)
          let elementsToClone = elementsFromDB || [];
          
          // 2.2 Se não encontrou elementos no banco, mas existem no state, usar o state como fallback
          if ((elementsToClone.length === 0) && hasElementsInState) {
            console.log(`StepActions - Usando elementos do state como fallback (${stepToClone.canvasElements.length} elementos)`);
            
            // Usar elementos do state para clonagem
            elementsToClone = stepToClone.canvasElements.map(el => {
              // Transformar elementos do state para formato da tabela canvas_elements
              return {
                id: generateValidUUID(),
                step_id: stepToClone.id,
                type: el.type || 'unknown',
                position: el.position || 0,
                config: el,
                created_at: now,
                updated_at: now
              };
            });
            
            elementsCount = elementsToClone.length;
            console.log(`StepActions - Transformados ${elementsCount} elementos do state para formato do banco`);
          }
          
          // Se encontrou elementos (no banco ou no state), duplicá-los para a nova etapa
          if (elementsToClone.length > 0) {
            // Deep clone de cada elemento com novo id e step_id
            const newElements = elementsToClone.map(el => {
              // Extrair uma cópia limpa sem o id original
              const { id: originalId, ...elWithoutId } = el;
              
              return {
                ...elWithoutId,
                id: generateValidUUID(),
                step_id: newStepId,
                created_at: now,
                updated_at: now
              };
            });
            
            console.log(`StepActions - Inserindo ${newElements.length} novos elementos do canvas para o step ${newStepId}`);
    
            // Inserir os novos elementos na tabela canvas_elements
            const { data: insertedElements, error: insertError } = await supabase
              .from('canvas_elements')
              .insert(newElements)
              .select();
            
            if (insertError) {
              console.error(`StepActions - Erro ao inserir novos elementos do canvas:`, insertError);
              
              // Tentar inserir um por um para identificar o problema específico
              for (let i = 0; i < newElements.length; i++) {
                try {
                  const { error: singleInsertError } = await supabase
                    .from('canvas_elements')
                    .insert([newElements[i]]);
                  
                  if (singleInsertError) {
                    console.error(`StepActions - Erro ao inserir elemento #${i}:`, singleInsertError);
                  } else {
                    console.log(`StepActions - Elemento #${i} inserido com sucesso`);
                  }
                } catch (singleError) {
                  console.error(`StepActions - Exceção ao inserir elemento #${i}:`, singleError);
                }
              }
            } else {
              console.log(`StepActions - Elementos do canvas duplicados com sucesso: ${insertedElements?.length || 0} elementos`);
              canvasElementsArray = insertedElements || [];
            }
          } else {
            console.log(`StepActions - Nenhum elemento do canvas encontrado para a etapa original (nem no banco nem no state)`);
            
            // Verificar se existe algum elemento na tabela canvas_elements (diagnóstico)
            const { count, error: countError } = await supabase
              .from('canvas_elements')
              .select('*', { count: 'exact', head: true });
            
            if (countError) {
              console.error(`StepActions - Erro ao verificar contagem de elementos:`, countError);
            } else {
              console.log(`StepActions - Total de elementos na tabela canvas_elements: ${count || 0}`);
            }
          }
        } catch (canvasError) {
          console.error(`StepActions - Exceção ao processar elementos do canvas:`, canvasError);
          // Continuar a função mesmo se houver erro nos elementos do canvas
        }
        
        // 4. Atualizar os order_index dos outros steps no banco
        const orderUpdatePromises = [];
        for (const step of updatedSteps) {
          if (step.order_index !== (step.order_index ?? 0)) {
            const updatePromise = supabase
              .from('steps')
              .update({ 
                order_index: step.order_index,
                updated_at: formatDateForSupabase()
              })
              .eq('id', step.id);
            
            orderUpdatePromises.push(updatePromise);
          }
        }
    
        if (orderUpdatePromises.length > 0) {
          console.log(`StepActions - Atualizando order_index de ${orderUpdatePromises.length} steps existentes`);
          await Promise.all(orderUpdatePromises)
            .catch(err => console.error(`StepActions - Erro ao atualizar order_index em lote:`, err));
        }
        
        console.log(`StepActions - Persistência direta concluída com sucesso`);
        
        // Retornar os dados para uso posterior
        return {
          newStepData,
          canvasElements: canvasElementsArray
        };
      } catch (persistError) {
        console.error(`StepActions - Erro na persistência direta:`, persistError);
        throw persistError;
      }
    };
    
    // IMPORTANTE: Pré-carregar os dados do canvas no cache local do getCanvasElements
    // Isso evita uma nova busca ao banco quando setCurrentStep for chamado
    // @ts-ignore - Propriedade dinâmica
    if (window.preloadedCanvasElements === undefined) {
      // @ts-ignore - Propriedade dinâmica
      window.preloadedCanvasElements = {};
    }
    
    // Executar a persistência e tratar resultados/erros
    try {
      const persistResult = await persistAll();
      console.log(`StepActions - Persistência direta concluída com sucesso`);
      
      // Processar elementos do canvas para formato correto se necessário
      let processedCanvasElements = [];
      if (persistResult.canvasElements && persistResult.canvasElements.length > 0) {
        processedCanvasElements = persistResult.canvasElements.map(element => {
          // Se o elemento tiver um campo config que é um objeto JSON, extrair seus dados
          if (element.config && typeof element.config === 'object') {
            return {
              ...element.config,
              id: element.id // Garantir que estamos usando o ID correto
            };
          }
          return element;
        });
        console.log(`StepActions - Processados ${processedCanvasElements.length} elementos para o novo step`);
      }
      
      // Armazenar os elementos processados no cache temporário usando o step_id como chave
      // @ts-ignore - Propriedade dinâmica
      window.preloadedCanvasElements[newStepId] = [...processedCanvasElements];
      console.log(`StepActions - Pré-carregados ${processedCanvasElements.length} elementos no cache temporário para step ${newStepId}`);
      
      // Notificar o Builder para prevenir recarregamento de elementos - ANTES de atualizar o estado
      try {
        // @ts-ignore - Propriedade dinâmica
        if (window.LEADFLUX_APP_HOOKS && window.LEADFLUX_APP_HOOKS.preventCanvasReload) {
          // @ts-ignore - Propriedade dinâmica
          window.LEADFLUX_APP_HOOKS.preventCanvasReload(newStepId);
          console.log(`StepActions - Notificado Builder para prevenir recarregamento para step ${newStepId}`);
        }
      } catch (hookError) {
        console.error(`StepActions - Erro ao acessar hooks da aplicação:`, hookError);
      }
      
      // Atualizar o estado com os dados completos do banco
      const finalStep = {
        ...newStep,
        ...persistResult.newStepData,
        canvasElements: processedCanvasElements // Garantir que canvasElements está definido
      };
      
      console.log(`StepActions - Atualizando estado com ${processedCanvasElements.length} elementos do canvas`);
      
      // Encontrar o índice do step no array atual de steps
      const newStepIndex = updatedFunnel.steps.findIndex(s => s.id === newStepId);
      if (newStepIndex !== -1) {
        // Criar uma cópia do array de steps e atualizar o step específico
        const updatedStepsWithElements = [...updatedFunnel.steps];
        updatedStepsWithElements[newStepIndex] = finalStep;
        
        // Atualizar o estado com o array de steps atualizado
        const finalFunnel = {
          ...updatedFunnel,
          steps: updatedStepsWithElements
        };
        
        // Importante: primeiro atualize o funnel COMPLETO com os canvasElements já incluídos
        set((state) => ({
          currentFunnel: finalFunnel,
          funnels: state.funnels.map((funnel) => 
            funnel.id === currentFunnel.id ? finalFunnel : funnel
          )
        }));
        
        // Aguardar o próximo ciclo para garantir que o estado do funnel foi atualizado
        setTimeout(() => {
          // Define o step atual para o novo step
          set({ currentStep: newStepIndex });
          console.log(`StepActions - Estado atualizado com elementos do canvas para o step ${newStepId} e currentStep definido para ${newStepIndex}`);
        }, 50);
      } else {
        console.error(`StepActions - Não foi possível encontrar o step ${newStepId} no estado atual`);
      }
      
      console.log(`StepActions - Duplicação concluída com sucesso`);
      return persistResult.newStepData;
    } catch (error) {
      console.error('StepActions - Falha na persistência direta, tentando via operationQueueService:', error);
      
      // Como fallback, utilizar o serviço de fila de operações em vez de tentar 
      // persistir diretamente para evitar o problema com 'n'
      try {
        const queuedResult = await new Promise<any>((resolve, reject) => {
    operationQueueService.enqueue(
      async (funnelData) => {
              try {
                console.log('StepActions - Executando operação enfileirada para persistência');
        const result = await persistenceService.saveFunnel(funnelData);
        
        if (!result.success) {
                  throw new Error(`Falha ao persistir funil: ${result.error}`);
        }
        
        return result.data;
              } catch (innerError) {
                console.error('StepActions - Erro na operação enfileirada:', innerError);
                throw innerError;
              }
      },
            updatedFunnel,
      {
              maxAttempts: 2,
              description: `Persistir funil após duplicação de step (via fila)`,
        onSuccess: (savedFunnel) => {
                console.log("StepActions - Step duplicado persistido com sucesso via fila");
                resolve(savedFunnel);
        },
              onError: (queueError) => {
                console.error(`StepActions - Erro ao persistir via fila:`, queueError);
                reject(queueError);
              }
            }
          );
        });
        
        if (queuedResult) {
          // Tratar queuedResult como um objeto com id para evitar erro de tipagem
          const typedResult = queuedResult as { id: string };
          
          set((state) => ({
            currentFunnel: queuedResult,
            funnels: state.funnels.map((funnel) => 
              funnel.id === typedResult.id ? queuedResult : funnel
            )
          }));
        }
        
        return stepToCreate;
      } catch (queueError) {
        console.error('StepActions - Falha definitiva ao persistir duplicação:', queueError);
        return stepToCreate; // Retornar pelo menos os dados locais criados
      }
    }
  } catch (error) {
    console.error('StepActions - Erro fatal ao duplicar step:', error);
    throw error;
  }
};

/**
 * Reordena os steps de um funil e persiste a nova ordem no Supabase
 */
export const reorderStepsAction = (set: any, get: any) => async (newStepsOrder: { id: string, order_index: number }[]) => {
  const { currentFunnel } = get();
  if (!currentFunnel) {
    console.error("Não foi possível reordenar: nenhum funil está selecionado");
    return;
  }

  try {
    console.log("StepActions - Reordenando etapas do funil", currentFunnel.id);
    
    // Criar uma cópia profunda do funil atual
    const funnelCopy = JSON.parse(JSON.stringify(currentFunnel));
    
    // Criar um mapa com os novos order_index para cada step
    const orderMap = newStepsOrder.reduce((map, item) => {
      map[item.id] = item.order_index;
      return map;
    }, {} as Record<string, number>);
    
    // Atualizar o order_index de cada step
    const updatedSteps = funnelCopy.steps.map((step: any) => {
      if (orderMap[step.id] !== undefined) {
        return {
          ...step,
          order_index: orderMap[step.id],
          updated_at: formatDateForSupabase()
        };
      }
      return step;
    });
    
    // Ordenar os steps pelo order_index
    updatedSteps.sort((a: any, b: any) => {
      const aIndex = a.order_index ?? 0;
      const bIndex = b.order_index ?? 0;
      return aIndex - bIndex;
    });
    
    // Atualizar o funil com os steps reordenados
    const updatedFunnel = {
      ...funnelCopy,
      steps: updatedSteps,
      updated_at: formatDateForSupabase()
    };
    
    // Atualizar o estado local imediatamente para UI responsiva
    set((state: any) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel: any) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      ),
    }));
    
    // Atualizar cada step no Supabase com seu novo order_index
    for (const { id, order_index } of newStepsOrder) {
      try {
        const { error } = await supabase
          .from('steps')
          .update({ order_index, updated_at: formatDateForSupabase() })
          .eq('id', id);
        
        if (error) {
          console.error(`StepActions - Erro ao atualizar order_index do step ${id}:`, error);
        }
      } catch (error) {
        console.error(`StepActions - Erro ao atualizar order_index do step ${id}:`, error);
      }
    }
    
    return true;
  } catch (error) {
    console.error("StepActions - Erro ao reordenar etapas:", error);
    return false;
  }
};
