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
  
  // Verificando se há elementos com imagens grandes
  let hasLargeImages = false;
  let totalSize = 0;
  const stringifiedElements = JSON.stringify(elementsCopy);
  totalSize = stringifiedElements.length;
  
  console.log(`CanvasActions - Tamanho dos elementos a serem salvos: ${totalSize} caracteres`);
  
  if (totalSize > 500000) {
    console.warn(`CanvasActions - Elementos muito grandes (${totalSize} chars), pode haver problemas na persistência`);
    hasLargeImages = true;
  }
  
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
    
    // Abordagem por partes para elementos grandes
    if (hasLargeImages) {
      console.log(`CanvasActions - Usando abordagem especializada para elementos com muitas imagens`);
      
      // Dividir em várias atualizações pequenas se houver muitas imagens
      try {
        // Fazer tentativas de acordo com o tamanho
        const step = updatedFunnel.steps[stepIndex];
        
        // 1. Primeiro tentar com o método tradicional
        try {
          console.log(`CanvasActions - Tentativa 1: Persistência direta de elementos grandes`);
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
          
          console.log(`CanvasActions - Elementos grandes persistidos com sucesso via método 1`);
          return;
        } catch (directError) {
          console.error(`CanvasActions - Erro na tentativa 1:`, directError);
          
          // 2. Tentar via persistStep que usa upsert
          try {
            console.log(`CanvasActions - Tentativa 2: Usando persistStep para elementos grandes`);
            const success = await persistenceService.persistStep(step, currentFunnel.id);
            
            if (!success) {
              throw new Error('Falha na persistência via persistStep');
            }
            
            console.log(`CanvasActions - Elementos grandes persistidos com sucesso via método 2`);
            return;
          } catch (persistStepError) {
            console.error(`CanvasActions - Erro na tentativa 2:`, persistStepError);
            
            // 3. Último recurso: salvar o funil inteiro
            console.log(`CanvasActions - Tentativa 3: Salvando funil inteiro para elementos grandes`);
            const result = await persistenceService.saveFunnel(updatedFunnel);
            
            if (!result.success) {
              throw new Error(`Falha ao salvar funil: ${result.error}`);
            }
            
            console.log(`CanvasActions - Funil inteiro persistido com sucesso para elementos grandes`);
          }
        }
      } catch (error) {
        console.error(`CanvasActions - Todas as tentativas de persistir elementos grandes falharam:`, error);
        throw error; // Propagar erro para tratamento mais abaixo
      }
    } 
    // MÉTODO 1: Persistir diretamente no step para máxima eficiência
    // Esta abordagem atualiza apenas o step específico, sem precisar carregar todo o funil
    else {
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

export const getCanvasElementsAction = (get: any) => async (stepId: string) => {
  const { currentFunnel } = get();
  if (!currentFunnel) return [];
  
  const step = currentFunnel.steps.find(s => s.id === stepId);
  
  // If the step doesn't exist, return empty array
  if (!step) {
    console.log(`Store - No step found with ID ${stepId}, returning empty array`);
    return [];
  }
  
  try {
    // PRIORIDADE 1: Verificar se há elementos pré-carregados no cache temporário
    // @ts-ignore - Propriedade dinâmica
    if (window.preloadedCanvasElements && window.preloadedCanvasElements[stepId]) {
      // @ts-ignore - Propriedade dinâmica
      const cachedElements = window.preloadedCanvasElements[stepId];
      console.log(`Store - Usando ${cachedElements.length} elementos pré-carregados do cache para step ${stepId}`);
      
      // Limpar o cache após o uso para não interferir em buscas futuras
      // @ts-ignore - Propriedade dinâmica
      delete window.preloadedCanvasElements[stepId];
      
      return JSON.parse(JSON.stringify(cachedElements)); // Return deep copy
    }
    
    // PRIORIDADE 2: Verificar se o objeto step já tem os elementos no state
    if (step.canvasElements && Array.isArray(step.canvasElements) && step.canvasElements.length > 0) {
      console.log(`Store - Usando ${step.canvasElements.length} elementos existentes no state do step ${stepId}`);
      return JSON.parse(JSON.stringify(step.canvasElements)); // Return deep copy
    }
    
    // Se não há elementos no cache ou no state, continuar com o fluxo normal buscando do banco
    
    // PRIORIDADE 3: Buscar elementos da tabela canvas_elements
    console.log(`Store - Buscando elementos do canvas para step ${stepId} da tabela canvas_elements`);
    
    const { data: elementsFromTable, error } = await supabase
      .from('canvas_elements')
      .select('*')
      .eq('step_id', stepId)
      .order('position', { ascending: true });
    
    if (error) {
      console.error(`Store - Erro ao buscar da tabela canvas_elements:`, error);
      // Continuar para usar os métodos alternativos abaixo
    } else if (elementsFromTable && elementsFromTable.length > 0) {
      console.log(`Store - Encontrados ${elementsFromTable.length} elementos na tabela canvas_elements`);
      
      // Extrair os dados de configuração de cada elemento
      const processedElements = elementsFromTable.map(element => {
        // Se o elemento tiver config como um objeto JSON, usar seus valores
        if (element.config && typeof element.config === 'object') {
          return {
            ...element.config,
            id: element.id // Garantir que estamos usando o ID correto
          };
        }
        
        // Caso contrário, apenas retornar o elemento diretamente
        return element;
      });
      
      // Guardar no step para referência futura e evitar busca repetida
      if (step && processedElements.length > 0) {
        step.canvasElements = processedElements;
      }
      
      return JSON.parse(JSON.stringify(processedElements)); // Return deep copy
    } else {
      console.log(`Store - Nenhum elemento encontrado na tabela canvas_elements, verificando métodos alternativos`);
    }
    
    // PRIORIDADE 4: Verificar se temos o adaptador e usar se disponível
    // @ts-ignore - Propriedade dinâmica
    if (window.stepsDatabaseAdapter) {
      console.log(`Store - Using adapter to get canvas elements for step ${stepId}`);
      // @ts-ignore - Propriedade dinâmica
      const elements = await window.stepsDatabaseAdapter.getCanvasElements(step);
      if (elements && Array.isArray(elements)) {
        console.log(`Store - Adapter returned ${elements.length} elements`);
        
        // Guardar no step para referência futura e evitar busca repetida
        if (step && elements.length > 0) {
          step.canvasElements = elements;
        }
        
        return JSON.parse(JSON.stringify(elements)); // Return deep copy
      }
    }
    
    // Fallback: Se não encontrou elementos em nenhum lugar, retornar array vazio
    console.log(`Store - No canvas elements found for step ${stepId} in any source, returning empty array`);
    return [];
  } catch (err) {
    console.error(`Store - Erro ao buscar elementos do canvas:`, err);
    
    // Fallback para o método original mesmo com erro
    if (step.canvasElements && Array.isArray(step.canvasElements)) {
      return JSON.parse(JSON.stringify(step.canvasElements));
    }
    
    return [];
  }
};
