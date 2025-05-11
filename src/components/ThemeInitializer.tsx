import { useEffect } from 'react';
import { useStore } from '@/utils/store';
import { updateThemeColor } from '@/lib/utils';

/**
 * Este componente inicializa as variáveis CSS do tema baseado nas configurações do funnel atual
 */
const ThemeInitializer = () => {
  const { currentFunnel } = useStore();

  // Atualizar a variável CSS quando o funnel atual mudar
  useEffect(() => {
    if (currentFunnel?.settings?.primaryColor) {
      updateThemeColor(currentFunnel.settings.primaryColor);
    }
  }, [currentFunnel?.id, currentFunnel?.settings?.primaryColor]);

  // Este componente não renderiza nada
  return null;
};

export default ThemeInitializer; 