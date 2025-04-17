/**
 * Utilitários para integração com Facebook Pixel
 * Funções para validação, inicialização e rastreamento seguro de eventos
 */

/**
 * Valida se o ID do Facebook Pixel está no formato correto
 * @param id ID do Facebook Pixel para validação
 * @returns boolean indicando se o ID é válido
 */
export function isValidPixelId(id: string | undefined): boolean {
  if (!id) return false;
  return /^\d{15,16}$/.test(id.trim());
}

/**
 * Retorna o script de inicialização do Facebook Pixel
 * @param pixelId ID do Facebook Pixel
 * @returns string com o script de inicialização
 */
export function getFacebookPixelInitScript(pixelId: string): string {
  if (!isValidPixelId(pixelId)) return '';
  
  return `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId.trim()}');
  `;
}

// Tipo para parâmetros de eventos
interface EventParams {
  [key: string]: any;
}

/**
 * Dispara um evento do Facebook Pixel com segurança
 * @param eventName Nome do evento (ex: PageView, Lead)
 * @param params Parâmetros adicionais do evento (opcional)
 */
export function safelyTrackEvent(eventName: string, params: EventParams = {}): void {
  // Verificar se estamos no browser
  if (typeof window === 'undefined') return;
  
  // Verificar preferências de privacidade do usuário
  if (localStorage.getItem('doNotTrack') === 'true') return;
  
  // Verificar se fbq está disponível
  if (!window.fbq) {
    // Tentar novamente quando fbq estiver disponível (máximo 3 segundos)
    let attempts = 0;
    const maxAttempts = 30; // 30 * 100ms = 3 segundos
    
    const checkFbq = setInterval(() => {
      attempts++;
      if (window.fbq) {
        executeFbqTrack(eventName, params);
        clearInterval(checkFbq);
      } else if (attempts >= maxAttempts) {
        console.warn('Facebook Pixel não disponível após várias tentativas');
        clearInterval(checkFbq);
      }
    }, 100);
    
    return;
  }
  
  executeFbqTrack(eventName, params);
}

/**
 * Função interna para executar o rastreamento com validação de parâmetros
 */
function executeFbqTrack(eventName: string, params: EventParams = {}): void {
  // Validar parâmetros para evitar injeção
  const safeParams: EventParams = {};
  
  // Processar os parâmetros comuns
  if (params.value !== undefined) {
    const value = parseFloat(params.value);
    if (!isNaN(value)) safeParams.value = value;
  }
  
  if (params.currency && typeof params.currency === 'string') {
    safeParams.currency = params.currency.substring(0, 3).toUpperCase();
  }
  
  // Adicionar outros parâmetros validados
  Object.keys(params).forEach(key => {
    if (!['value', 'currency'].includes(key) && params[key] !== undefined) {
      // Para strings, limitar tamanho para evitar injeção
      if (typeof params[key] === 'string') {
        safeParams[key] = params[key].substring(0, 100);
      } 
      // Números são seguros para passar diretamente
      else if (typeof params[key] === 'number') {
        safeParams[key] = params[key];
      }
      // Booleanos são seguros para passar diretamente
      else if (typeof params[key] === 'boolean') {
        safeParams[key] = params[key];
      }
    }
  });
  
  // Limitar frequência de eventos (anti-spam)
  const now = Date.now();
  if (!window._lastFbEventTime) window._lastFbEventTime = {};
  const lastEventTime = window._lastFbEventTime[eventName] || 0;
  
  if (now - lastEventTime > 500) { // Máximo 2 eventos do mesmo tipo por segundo
    try {
      window.fbq('track', eventName, safeParams);
      window._lastFbEventTime[eventName] = now;
    } catch (error) {
      console.error('Erro ao rastrear evento do Facebook Pixel:', error);
    }
  }
}

// Adicionar os tipos ao Window global
declare global {
  interface Window {
    fbq: any;
    _lastFbEventTime: {
      [eventName: string]: number;
    };
  }
} 