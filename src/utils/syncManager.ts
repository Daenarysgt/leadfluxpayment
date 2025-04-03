/**
 * Gerenciador de sincronização para garantir que os dados do frontend e do Supabase
 * estejam sempre alinhados, resolvendo o problema de persistência de steps
 */

import { Funnel, Step } from "@/utils/types";
import { funnelService } from "@/services/funnelService";
import { persistenceService } from "@/services/persistenceService";
import { supabase } from "@/lib/supabase";

export const syncManager = {
  /**
   * Sincroniza um funil específico garantindo que todos os steps sejam
   * corretamente salvos e recuperados do Supabase
   */
  async syncFunnel(funnel: Funnel): Promise<Funnel> {
    console.log(`SyncManager - Iniciando sincronização do funil ${funnel.id}`);
    
    try {
      // Usar o serviço de persistência para salvar funil completo
      const { success, data } = await persistenceService.saveFunnel(funnel);
      
      if (!success) {
        console.error("SyncManager - Falha ao salvar funil no Supabase");
        return funnel;
      }
      
      console.log(`SyncManager - Funil sincronizado com ${data.steps?.length || 0} steps`);
      return data;
    } catch (error) {
      console.error("SyncManager - Erro durante sincronização:", error);
      return funnel;
    }
  },
  
  /**
   * Sincroniza todos os steps de um funil, garantindo que estejam
   * corretamente salvos no Supabase
   */
  async syncSteps(funnel: Funnel): Promise<Step[]> {
    if (!funnel || !funnel.steps || funnel.steps.length === 0) {
      console.log("SyncManager - Nenhum step para sincronizar");
      return [];
    }
    
    console.log(`SyncManager - Sincronizando ${funnel.steps.length} steps`);
    
    try {
      // Persistir funil para garantir que os steps sejam salvos
      const { success, data } = await persistenceService.saveFunnel(funnel);
      
      if (success && data.steps) {
        console.log(`SyncManager - Steps sincronizados: ${data.steps.length}`);
        return data.steps;
      }
      
      return funnel.steps;
    } catch (error) {
      console.error("SyncManager - Erro ao sincronizar steps:", error);
      return funnel.steps;
    }
  },
  
  /**
   * Função para resolver problemas quando o frontend e backend estão dessincronizados
   * Força a sincronização completa com o Supabase
   */
  async repairFunnelSync(funnel: Funnel): Promise<Funnel> {
    console.log(`SyncManager - Iniciando reparo completo para funil ${funnel.id}`);
    
    try {
      // 1. Buscar o funil completo do Supabase primeiro
      const { data: remoteFunnel } = await supabase
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
      
      // 2. Mesclar dados do funil remoto com o local
      const mergedFunnel = this.mergeFunnels(funnel, remoteFunnel);
      
      // 3. Forçar persistência completa
      const { success, data } = await persistenceService.saveFunnel(mergedFunnel);
      
      if (success) {
        console.log(`SyncManager - Reparo concluído: ${data.steps?.length || 0} steps sincronizados`);
        return data;
      }
      
      console.error("SyncManager - Reparo não foi totalmente bem-sucedido");
      return mergedFunnel;
    } catch (error) {
      console.error("SyncManager - Erro durante reparo:", error);
      
      // Em caso de falha, tentar salvar diretamente o funil local
      const { data } = await persistenceService.saveFunnel(funnel);
      return data || funnel;
    }
  },
  
  /**
   * Mescla dados entre um funil local e um funil remoto
   * Prioriza dados locais, mas preserva relacionamentos remotos
   */
  mergeFunnels(localFunnel: Funnel, remoteFunnel: Funnel | null): Funnel {
    if (!remoteFunnel) return localFunnel;
    
    // Manter dados básicos locais
    const merged = {
      ...localFunnel,
      // Garantir IDs corretos
      id: localFunnel.id || remoteFunnel.id,
      user_id: remoteFunnel.user_id
    };
    
    // Mesclar steps, priorizando locais
    if (localFunnel.steps && localFunnel.steps.length > 0) {
      // Se temos steps locais, manter mas tentar preservar IDs dos remotos
      if (remoteFunnel.steps && remoteFunnel.steps.length > 0) {
        // Mapear steps remotos por posição para fácil acesso
        const remoteStepsByPosition = new Map();
        
        remoteFunnel.steps.forEach(step => {
          if (step.position !== undefined) {
            remoteStepsByPosition.set(step.position, step);
          }
        });
        
        // Atualizar cada step local com ID correspondente do remoto
        merged.steps = localFunnel.steps.map((step, index) => {
          const remoteStep = remoteStepsByPosition.get(index);
          
          if (remoteStep) {
            // Se o step local já tem ID, manter
            // Caso contrário, usar ID do remoto
            return {
              ...step,
              id: step.id || remoteStep.id,
              funnel_id: remoteFunnel.id
            };
          }
          
          return step;
        });
      }
    } else if (remoteFunnel.steps && remoteFunnel.steps.length > 0) {
      // Se não temos steps locais mas temos remotos, usar os remotos
      merged.steps = remoteFunnel.steps;
    }
    
    return merged;
  }
}; 