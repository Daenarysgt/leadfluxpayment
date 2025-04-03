import { persistenceService } from '@/services/persistenceService';
import { operationQueueService } from '@/services/operationQueueService';
import { supabase } from '@/lib/supabase';

export const setCanvasElementsAction = (set: any, get: any) => async (stepId: string, elements: any[]) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return;
  
  console.log(`Store - Salvando ${elements.length} canvas elements para step ${stepId}`);
  
  // Create a deep copy of the current funnel to avoid shared references
  const funnelCopy = JSON.parse(JSON.stringify(currentFunnel));
  
  // Find the step to update
  const stepIndex = funnelCopy.steps.findIndex((step) => step.id === stepId);
  if (stepIndex === -1) {
    console.error(`Store - Step with ID ${stepId} not found in funnel`);
    return;
  }
  
  // Create a deep copy of the elements to avoid reference issues
  const elementsCopy = JSON.parse(JSON.stringify(elements));
  
  // Update the specific step with the new elements
  funnelCopy.steps[stepIndex] = {
    ...funnelCopy.steps[stepIndex],
    canvasElements: elementsCopy,
    updated_at: new Date().toISOString() // Importante atualizar o timestamp
  };
  
  // Update the funnel with the current timestamp
  const updatedFunnel = {
    ...funnelCopy,
    updated_at: new Date().toISOString(),
  };
  
  try {
    // Atualizar o estado local imediatamente para UI responsiva
    set((state) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      ),
    }));
    
    // MÉTODO 1: Persistir diretamente no step para máxima eficiência
    // Esta abordagem atualiza apenas o step específico, sem precisar carregar todo o funil
    try {
      console.log(`CanvasActions - Persistindo elementos do canvas diretamente no step ${stepId}`);
      
      // Encontrar o step atualizado
      const step = updatedFunnel.steps[stepIndex];
      
      // Atualizar diretamente no banco só o step com seus canvasElements
      const { error } = await supabase
        .from('steps')
        .update({
          canvasElements: step.canvasElements,
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId);
      
      if (error) {
        throw error;
      }
      
      console.log(`CanvasActions - Elementos do canvas persistidos com sucesso diretamente no step ${stepId}`);
      
      // Força atualização do funil para garantir que tudo está sincronizado
      const { data: refreshedStep } = await supabase
        .from('steps')
        .select('canvasElements')
        .eq('id', stepId)
        .single();
      
      if (refreshedStep) {
        console.log(`CanvasActions - Confirmação: step ${stepId} tem ${refreshedStep.canvasElements?.length || 0} elementos salvos no banco`);
      }
    } 
    // MÉTODO 2: Salvar o step completo via persistenceService
    catch (error) {
      console.error(`CanvasActions - Erro ao persistir diretamente, tentando via persistStep:`, error);
      
      try {
        // Usar o método persistStep que é mais específico e eficiente
        const step = updatedFunnel.steps[stepIndex];
        const success = await persistenceService.persistStep(step, currentFunnel.id);
        
        if (!success) {
          throw new Error(`Falha ao salvar step ${stepId}`);
        }
        
        console.log(`CanvasActions - Step ${stepId} persistido com sucesso via persistStep`);
      }
      // MÉTODO 3: Salvar o funil inteiro como último recurso
      catch (stepError) {
        console.error(`CanvasActions - Erro ao usar persistStep, tentando salvar todo o funil:`, stepError);
        
        const result = await persistenceService.saveFunnel(updatedFunnel);
        
        if (!result.success) {
          throw new Error(`Falha ao salvar funil: ${result.error}`);
        }
        
        console.log(`CanvasActions - Funil inteiro persistido com sucesso`);
      }
    }
  } catch (error) {
    console.error("Store - Erro ao salvar elementos do canvas:", error);
    
    // Mesmo com erro, mantemos o estado local atualizado para não perder as alterações do usuário
    set((state) => ({
      currentFunnel: updatedFunnel,
      funnels: state.funnels.map((funnel) => 
        funnel.id === currentFunnel.id ? updatedFunnel : funnel
      ),
    }));
    
    // Último recurso: enfileirar para tentar novamente mais tarde
    operationQueueService.enqueue(
      async (funnelData) => {
        console.log(`CanvasActions - Tentativa de recuperação via fila`);
        const result = await persistenceService.saveFunnel(funnelData);
        
        if (!result.success) {
          throw new Error(`Falha na recuperação: ${result.error}`);
        }
        
        return result.data;
      },
      updatedFunnel,
      {
        maxAttempts: 5,
        description: `Recuperação de salvamento para step ${stepId}`,
        onSuccess: (savedFunnel) => {
          console.log("CanvasActions - Recuperação bem-sucedida via fila");
        },
        onError: (error) => {
          console.error(`CanvasActions - Falha na recuperação via fila:`, error);
        }
      }
    );
  }
};

export const getCanvasElementsAction = (get: any) => (stepId: string) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return [];
  
  const step = currentFunnel.steps.find(s => s.id === stepId);
  
  // If the step doesn't exist, return empty array
  if (!step) {
    console.log(`Store - No step found with ID ${stepId}, returning empty array`);
    return [];
  }
  
  // Verificar se temos o adaptador e usar se disponível
  if (window.stepsDatabaseAdapter) {
    console.log(`Store - Using adapter to get canvas elements for step ${stepId}`);
    const elements = window.stepsDatabaseAdapter.getCanvasElements(step);
    if (elements && Array.isArray(elements)) {
      console.log(`Store - Adapter returned ${elements.length} elements`);
      return JSON.parse(JSON.stringify(elements)); // Return deep copy
    }
  }
  
  // Fallback para o método original
  if (!step.canvasElements) {
    console.log(`Store - No canvas elements found for step ${stepId}, returning empty array`);
    return [];
  }
  
  const elements = step.canvasElements;
  console.log(`Store - Retrieved ${elements.length} canvas elements for step ${stepId}`);
  
  // Return a deep copy to avoid mutation issues
  return JSON.parse(JSON.stringify(elements));
};
