import { funnelService } from '@/services/funnelService';
import { persistenceService } from '@/services/persistenceService';
import { operationQueueService } from '@/services/operationQueueService';
import { Funnel } from '../types';

export const createFunnelAction = (set: any, get: any) => async (name: string) => {
  try {
    const newFunnel = await funnelService.createFunnel({
      name,
      settings: {
        primaryColor: '#0066ff',
        backgroundColor: '#ffffff',
        fontFamily: 'SF Pro Display',
        showProgressBar: true,
        collectLeadData: true
      },
      steps: []
    });

    set((state: any) => ({
      funnels: [...state.funnels, newFunnel],
      currentFunnel: newFunnel,
      currentStep: 0
    }));

    return newFunnel;
  } catch (error) {
    console.error('Error creating funnel:', error);
    throw error;
  }
};

export const updateFunnelAction = (set: any) => async (funnel: Funnel) => {
  try {
    console.log('Iniciando atualização do funil na store:', funnel.id);
    
    // Verificar se temos steps para persistir (apenas para log)
    if (funnel.steps && funnel.steps.length > 0) {
      console.log(`updateFunnelAction - Funil com ${funnel.steps.length} steps`);
      
      // Log detalhado para debugging
      funnel.steps.forEach((step, index) => {
        console.log(`Step ${index}: ${step.id} - ${step.title}`, 
          step.canvasElements ? `com ${step.canvasElements.length} elementos` : 'sem elementos'
        );
      });
    } else {
      console.warn('updateFunnelAction - Funil não tem steps para persistir!');
    }
    
    // Criar uma cópia profunda para garantir que todas as referências são quebradas
    const funnelToUpdate = JSON.parse(JSON.stringify(funnel));
    
    // Garantir que o timestamp de atualização é definido
    if (!funnelToUpdate.updated_at) {
      funnelToUpdate.updated_at = new Date().toISOString();
    }
    
    // Atualizar o estado local imediatamente para feedback rápido do usuário
    const originalFunnel = { ...funnelToUpdate };
    
    set((state: any) => {
      // Atualizar o estado local imediatamente para UI responsiva
      const updatedFunnels = state.funnels.map((f: Funnel) => 
        f.id === funnelToUpdate.id ? funnelToUpdate : f
      );
      
      const newCurrentFunnel = state.currentFunnel?.id === funnelToUpdate.id 
        ? funnelToUpdate 
        : state.currentFunnel;
      
      return {
        funnels: updatedFunnels,
        currentFunnel: newCurrentFunnel
      };
    });
    
    // Enfileirar a operação de persistência com recuperação automática
    operationQueueService.enqueue(
      async (dataToSave: Funnel) => {
        // Usando o novo serviço de persistência
        const result = await persistenceService.saveFunnel(dataToSave);
        
        if (!result.success) {
          throw new Error(`Falha ao salvar funil: ${result.error}`);
        }
        
        return result.data;
      },
      funnelToUpdate,
      {
        maxAttempts: 3,
        description: `Salvar funil ${funnel.id}`,
        onSuccess: (updatedFunnel) => {
          console.log('Funil atualizado com sucesso após persistência:', updatedFunnel);
          
          // Atualizar o estado com os dados mais recentes do servidor, mantendo steps local
          set((state: any) => {
            // Mesclar dados do servidor com steps locais
            const serverFunnel = {
              ...updatedFunnel,
              steps: originalFunnel.steps // Manter steps locais
            };
            
            const updatedFunnels = state.funnels.map((f: Funnel) => 
              f.id === serverFunnel.id ? serverFunnel : f
            );
            
            const newCurrentFunnel = state.currentFunnel?.id === serverFunnel.id 
              ? serverFunnel 
              : state.currentFunnel;
            
            return {
              funnels: updatedFunnels,
              currentFunnel: newCurrentFunnel
            };
          });
        },
        onError: (error) => {
          console.error('Falha definitiva ao atualizar funil:', error);
          // Não reverter o estado, manter o que o usuário vê, mas registrar o erro
        }
      }
    );
    
    // Retornar cópia do funil local para feedback imediato
    return funnelToUpdate;
  } catch (error) {
    console.error('Error updating funnel:', error);
    throw error;
  }
};

export const deleteFunnelAction = (set: any) => async (id: string) => {
  try {
    await funnelService.deleteFunnel(id);

    set((state: any) => ({
      funnels: state.funnels.filter((f: Funnel) => f.id !== id),
      currentFunnel: state.currentFunnel?.id === id ? null : state.currentFunnel
    }));
  } catch (error) {
    console.error('Error deleting funnel:', error);
    throw error;
  }
};

export const renameFunnelAction = (set: any) => async (id: string, newName: string) => {
  try {
    if (!newName || newName.trim() === '') {
      throw new Error('Nome do funil não pode estar vazio');
    }
    
    // Atualizar o nome no Supabase 
    // O updateFunnel vai gerar automaticamente o slug com base no novo nome
    const updatedFunnel = await funnelService.updateFunnel(id, {
      name: newName.trim(),
      updated_at: new Date().toISOString()
    });
    
    // Atualizar o estado local para refletir a mudança
    set((state: any) => {
      // Atualizar o funil na lista
      const updatedFunnels = state.funnels.map((f: Funnel) => 
        f.id === id ? { 
          ...f, 
          name: newName.trim(),
          slug: updatedFunnel.slug // Atualizar também o slug no estado local
        } : f
      );
      
      // Atualizar o funnel atual se for o mesmo
      const newCurrentFunnel = state.currentFunnel?.id === id 
        ? { 
            ...state.currentFunnel, 
            name: newName.trim(),
            slug: updatedFunnel.slug // Atualizar também o slug no estado local do funil atual
          } 
        : state.currentFunnel;
      
      return {
        funnels: updatedFunnels,
        currentFunnel: newCurrentFunnel
      };
    });
    
    return updatedFunnel;
  } catch (error) {
    console.error('Error renaming funnel:', error);
    throw error;
  }
};

export const duplicateFunnelAction = (set: any) => async (id: string) => {
  try {
    console.log('Iniciando duplicação do funil na store:', id);
    
    // Chamar o serviço para duplicar o funil no banco de dados
    const duplicatedFunnel = await funnelService.duplicateFunnel(id);
    
    // Atualizar o estado local para incluir o novo funil duplicado
    set((state: any) => ({
      funnels: [...state.funnels, duplicatedFunnel],
    }));
    
    console.log('Funil duplicado com sucesso:', duplicatedFunnel.id);
    return duplicatedFunnel;
  } catch (error) {
    console.error('Error duplicating funnel:', error);
    throw error;
  }
};

export const setCurrentFunnelAction = (set: any, get: any) => async (id: string | null) => {
  if (id === null) {
    set({ currentFunnel: null, currentStep: 0 });
    return;
  }

  console.log(`setCurrentFunnelAction - Carregando funil ${id}`);
  
  try {
    // 1. Primeiro atualizar o estado com dados locais para feedback rápido ao usuário
    const localFunnel = get().funnels.find((f: Funnel) => f.id === id);
    if (localFunnel) {
      console.log(`setCurrentFunnelAction - Funil encontrado localmente, usando temporariamente`);
      set({ currentFunnel: localFunnel, currentStep: 0 });
    }
    
    // 2. Forçar atualização dos canvasElements para garantir consistência
    await funnelService.refreshFunnelCanvasElements(id);
    
    // 3. Carregar o funil atualizado do servidor
    const updatedFunnel = await funnelService.getFunnelById(id);
    
    if (updatedFunnel) {
      console.log(`setCurrentFunnelAction - Funil atualizado carregado do servidor`);
      
      // Verificar se todos os steps têm canvasElements definidos
      if (updatedFunnel.steps) {
        updatedFunnel.steps.forEach(step => {
          if (!step.canvasElements) {
            console.log(`setCurrentFunnelAction - Step ${step.id} não tem canvasElements, inicializando array vazio`);
            step.canvasElements = [];
          } else {
            console.log(`setCurrentFunnelAction - Step ${step.id} tem ${step.canvasElements.length} canvasElements`);
          }
        });
      }
      
      // Atualizar o estado com dados completos do servidor
      set((state: any) => ({
        currentFunnel: updatedFunnel,
        currentStep: 0,
        // Também atualizar a lista de funnels
        funnels: state.funnels.map((f: Funnel) => f.id === id ? updatedFunnel : f)
      }));
    }
  } catch (error) {
    console.error(`setCurrentFunnelAction - Erro ao carregar funil ${id}:`, error);
    
    // Fallback para dados locais se o carregamento falhar
    const localFunnel = get().funnels.find((f: Funnel) => f.id === id);
    if (localFunnel) {
      console.log(`setCurrentFunnelAction - Usando dados locais após falha no carregamento`);
      set({ currentFunnel: localFunnel, currentStep: 0 });
    }
  }
};

export const setFunnelsAction = (set: any) => (funnels: Funnel[]) => {
  set({ funnels });
};
