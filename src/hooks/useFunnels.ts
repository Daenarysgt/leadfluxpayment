import { useEffect, useState } from 'react';
import { useStore } from '@/utils/store';
import { funnelService } from '@/services/funnelService';
import { Funnel } from '@/utils/types';
import { useAuth } from '@/hooks/useAuth';
import { syncManager } from '@/utils/syncManager';

export const useFunnels = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { funnels, setFunnels, setCurrentFunnel } = useStore();
  const { user } = useAuth();

  useEffect(() => {
    const loadFunnels = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await funnelService.getFunnels();
        setFunnels(data);
      } catch (error) {
        console.error('Error loading funnels:', error);
        setError('Failed to load funnels');
      } finally {
        setLoading(false);
      }
    };

    loadFunnels();
  }, [setFunnels, user]);

  const refreshFunnels = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await funnelService.getFunnels();
      setFunnels(data);
    } catch (error) {
      console.error('Error refreshing funnels:', error);
      setError('Failed to refresh funnels');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Carrega um funil específico e garante que os dados estejam sincronizados
   * entre o frontend e o Supabase
   */
  const loadFunnel = async (id: string): Promise<Funnel | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar funil do Supabase
      const funnel = await funnelService.getFunnelById(id);
      
      if (!funnel) {
        setError('Funil não encontrado');
        return null;
      }
      
      // Atualizar o estado global
      setCurrentFunnel(funnel.id);
      
      return funnel;
    } catch (error) {
      console.error(`Error loading funnel ${id}:`, error);
      setError('Falha ao carregar o funil');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Salva um funil garantindo que os steps sejam persistidos corretamente
   */
  const saveFunnel = async (funnel: Funnel): Promise<Funnel> => {
    try {
      setLoading(true);
      
      // Usar o syncManager para garantir sincronização completa
      const syncedFunnel = await syncManager.syncFunnel(funnel);
      
      // Atualizar o estado global com o funil sincronizado
      setCurrentFunnel(syncedFunnel.id);
      
      // Atualizar a lista de funis
      await refreshFunnels();
      
      return syncedFunnel;
    } catch (error) {
      console.error('Error saving funnel:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Função de reparo para casos onde os steps foram perdidos
   * ou estão dessincronizados
   */
  const repairFunnel = async (funnel: Funnel): Promise<Funnel> => {
    try {
      setLoading(true);
      
      const repairedFunnel = await syncManager.repairFunnelSync(funnel);
      setCurrentFunnel(repairedFunnel.id);
      
      return repairedFunnel;
    } catch (error) {
      console.error('Error repairing funnel:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    funnels,
    loading,
    error,
    refreshFunnels,
    loadFunnel,
    saveFunnel,
    repairFunnel
  };
}; 