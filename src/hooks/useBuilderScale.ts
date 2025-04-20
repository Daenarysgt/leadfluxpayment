import { useState, useEffect } from 'react';

// Chave para armazenar a preferência do usuário no localStorage
const BUILDER_SCALE_KEY = 'leadflux_builder_scale_enabled';

interface UseBuilderScaleResult {
  scaleEnabled: boolean;
  toggleScale: () => void;
  enableScale: () => void;
  disableScale: () => void;
}

/**
 * Hook para gerenciar a escala da interface do Builder
 * Salva a configuração no localStorage para persistir entre sessões
 */
export const useBuilderScale = (): UseBuilderScaleResult => {
  // Inicializar com o valor salvo no localStorage ou true por padrão
  const [scaleEnabled, setScaleEnabled] = useState<boolean>(() => {
    const savedValue = localStorage.getItem(BUILDER_SCALE_KEY);
    // Se não houver valor salvo, assume como true (escala ativada)
    return savedValue !== null ? savedValue === 'true' : true;
  });

  // Salvar no localStorage quando a configuração mudar
  useEffect(() => {
    localStorage.setItem(BUILDER_SCALE_KEY, String(scaleEnabled));
  }, [scaleEnabled]);

  // Função para alternar entre ativado/desativado
  const toggleScale = () => setScaleEnabled(prev => !prev);
  
  // Funções específicas para ativar/desativar
  const enableScale = () => setScaleEnabled(true);
  const disableScale = () => setScaleEnabled(false);

  return {
    scaleEnabled,
    toggleScale,
    enableScale,
    disableScale
  };
};

export default useBuilderScale; 