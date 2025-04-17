import { useEffect, useRef } from 'react';
import { isValidPixelId, getFacebookPixelInitScript, safelyTrackEvent } from '@/utils/pixelUtils';

interface FacebookPixelProps {
  pixelId: string;
  isLastPage?: boolean;
  trackPageView?: boolean;
  trackCompleteRegistration?: boolean;
}

/**
 * Componente para injeção e gerenciamento do Facebook Pixel
 * 
 * Este componente:
 * 1. Valida o ID do pixel
 * 2. Injeta o script do Facebook Pixel na página
 * 3. Rastreia eventos conforme configuração (PageView, CompleteRegistration)
 * 
 * @example
 * <FacebookPixel 
 *   pixelId="123456789012345"
 *   isLastPage={isLastStep}
 *   trackPageView={true}
 *   trackCompleteRegistration={true} 
 * />
 */
const FacebookPixel = ({ 
  pixelId, 
  isLastPage = false, 
  trackPageView = true, 
  trackCompleteRegistration = true 
}: FacebookPixelProps) => {
  const initialized = useRef(false);

  // Não renderizar nada se o ID for inválido
  if (!isValidPixelId(pixelId)) return null;

  // Injetar o script do Facebook Pixel
  useEffect(() => {
    // Evitar inicialização duplicada
    if (initialized.current) return;
    
    // Verificar se já existe script do Facebook Pixel na página
    if (document.getElementById('facebook-pixel-script')) {
      initialized.current = true;
      return;
    }

    try {
      // Criar elemento de script
      const script = document.createElement('script');
      script.id = 'facebook-pixel-script';
      script.innerHTML = getFacebookPixelInitScript(pixelId);
      
      // Adicionar o script ao head
      document.head.appendChild(script);

      // Criar o noscript fallback
      const noscript = document.createElement('noscript');
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      
      // Adicionar o noscript ao head
      document.head.appendChild(noscript);
      
      initialized.current = true;
      
      // Limpar na desmontagem
      return () => {
        try {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
          if (noscript.parentNode) {
            noscript.parentNode.removeChild(noscript);
          }
        } catch (error) {
          console.error('Erro ao remover scripts do Facebook Pixel:', error);
        }
      };
    } catch (error) {
      console.error('Erro ao inicializar Facebook Pixel:', error);
    }
  }, [pixelId]);

  // Rastrear PageView quando o componente montar
  useEffect(() => {
    if (trackPageView) {
      safelyTrackEvent('PageView');
    }
  }, [trackPageView]);

  // Rastrear CompleteRegistration quando for a última página
  useEffect(() => {
    if (isLastPage && trackCompleteRegistration) {
      safelyTrackEvent('CompleteRegistration');
    }
  }, [isLastPage, trackCompleteRegistration]);

  // Este componente não renderiza nada visível
  return null;
};

export default FacebookPixel; 