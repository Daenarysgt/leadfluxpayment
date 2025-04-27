import { useState, useEffect } from 'react';
import { useStore } from '@/utils/store';
import { Funnel } from '@/utils/types';

export const useFunnel = (funnelId?: string) => {
  const { funnels, currentFunnel, setCurrentFunnel } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funnelId && (!currentFunnel || currentFunnel.id !== funnelId)) {
      setLoading(true);
      setError(null);
      
      // Procurar o funil na store
      const foundFunnel = funnels.find(f => f.id === funnelId);
      if (foundFunnel) {
        setCurrentFunnel(funnelId);
        setLoading(false);
      } else {
        setError(`Funil não encontrado (ID: ${funnelId})`);
        setLoading(false);
      }
    }
  }, [funnelId, funnels, currentFunnel, setCurrentFunnel]);

  return {
    funnel: currentFunnel,
    loading,
    error
  };
};

export default useFunnel; 