import { isValidPixelId, getFacebookPixelInitScript, safelyTrackEvent } from '@/utils/pixelUtils';
import { useEffect, useRef } from 'react';

// Variável global para controlar se o pixel já foi inicializado
declare global {
  interface Window {
    fbq: any;
    _fbPixelInitialized?: { [key: string]: boolean };
  }
}

interface FacebookPixelProps {
  pixelId?: string;
  trackPageView?: boolean;
  trackRegistrationComplete?: boolean;
}

/**
 * Componente para integração do Facebook Pixel
 * 
 * Exemplo de uso:
 * <FacebookPixel 
 *   pixelId="123456789012345" 
 *   trackPageView={true}
 *   trackRegistrationComplete={false}
 * />
 */
const FacebookPixel = ({ 
  pixelId, 
  trackPageView = false,
  trackRegistrationComplete = false
}: FacebookPixelProps) => {
  const pixelInitialized = useRef(false);

  useEffect(() => {
    // Se não houver um ID de pixel válido, não faça nada
    if (!pixelId || !isValidPixelId(pixelId)) {
      return;
    }

    // Inicialize o objeto de controle se ainda não existir
    if (!window._fbPixelInitialized) {
      window._fbPixelInitialized = {};
    }

    // Verifica se este pixel específico já foi inicializado e se não foi injetado o script
    const isFirstInitialization = !window._fbPixelInitialized[pixelId] && !pixelInitialized.current;
    
    if (isFirstInitialization) {
      // Marca este pixel como inicializado globalmente e também no componente
      window._fbPixelInitialized[pixelId] = true;
      pixelInitialized.current = true;

      // Injetar o script no DOM para o Facebook Pixel
      const script = document.createElement('script');
      script.id = `facebook-pixel-${pixelId}`;
      script.innerHTML = getFacebookPixelInitScript(pixelId);
      document.head.appendChild(script);
      
      // Rastreia visualização de página se solicitado
      if (trackPageView) {
        safelyTrackEvent('PageView');
      }
    }

    // Rastreia conclusão de registro se solicitado
    if (trackRegistrationComplete) {
      safelyTrackEvent('CompleteRegistration');
    }

    return () => {
      // Não desativa o pixel quando o componente é desmontado
      // para evitar problemas quando o componente é remontado
    };
  }, [pixelId, trackPageView, trackRegistrationComplete]);

  // Componente não renderiza nada visível
  return null;
};

export default FacebookPixel; 