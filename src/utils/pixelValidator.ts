/**
 * Utilitários para validação e teste do Facebook Pixel
 */

/**
 * Verifica se o Facebook Pixel está instalado e funcionando corretamente
 * @returns Objeto com o status da validação e detalhes
 */
export function validateFacebookPixel(): PixelValidationResult {
  const result: PixelValidationResult = {
    isInstalled: false,
    hasTracking: false,
    pixelId: null,
    errors: [],
    details: {}
  };

  // Verificar se fbq está definido
  if (typeof window.fbq !== 'function') {
    result.errors.push('Facebook Pixel não está instalado');
    return result;
  }

  result.isInstalled = true;
  result.details.fbqFunction = true;

  // Verificar se o ID do Pixel está definido
  try {
    // Tentar encontrar o ID do Pixel
    const pixelIdMatch = document.body.innerHTML.match(/fbq\('init', ['"]([0-9]+)['"]\)/);
    if (pixelIdMatch && pixelIdMatch[1]) {
      result.pixelId = pixelIdMatch[1];
      result.details.pixelIdFound = true;
    } else {
      result.errors.push('ID do Facebook Pixel não encontrado');
    }
  } catch (error) {
    result.errors.push('Erro ao verificar ID do Pixel: ' + (error as Error).message);
  }

  // Verificar se há rastreamento PageView
  try {
    const pageViewMatch = document.body.innerHTML.match(/fbq\('track', ['"]PageView['"]\)/);
    if (pageViewMatch) {
      result.hasTracking = true;
      result.details.pageViewTracking = true;
    }
  } catch (error) {
    result.errors.push('Erro ao verificar rastreamento PageView: ' + (error as Error).message);
  }

  // Verificar se a imagem noscript está definida
  try {
    const noscriptImages = document.querySelectorAll('noscript img[src*="facebook.com/tr"]');
    result.details.noscriptFound = noscriptImages.length > 0;
  } catch (error) {
    result.errors.push('Erro ao verificar tag noscript: ' + (error as Error).message);
  }

  return result;
}

/**
 * Testa um evento do Facebook Pixel sem realmente enviá-lo
 * @param eventName Nome do evento para testar
 * @param params Parâmetros do evento
 * @returns Resultado do teste
 */
export function testPixelEvent(eventName: string, params: any = {}): PixelEventTestResult {
  const result: PixelEventTestResult = {
    success: false,
    eventName,
    params,
    errors: []
  };

  // Verificar se fbq está definido
  if (typeof window.fbq !== 'function') {
    result.errors.push('Facebook Pixel não está instalado');
    return result;
  }

  // Validar nome do evento
  if (!eventName || typeof eventName !== 'string') {
    result.errors.push('Nome do evento inválido');
    return result;
  }

  // Validar parâmetros
  if (params && typeof params === 'object') {
    // Validar parâmetros específicos
    if (params.value !== undefined) {
      const value = parseFloat(params.value);
      if (isNaN(value)) {
        result.errors.push('Parâmetro "value" deve ser um número válido');
      }
    }

    if (params.currency !== undefined && typeof params.currency !== 'string') {
      result.errors.push('Parâmetro "currency" deve ser uma string');
    }
  } else if (params !== undefined) {
    result.errors.push('Parâmetros devem ser um objeto válido');
    return result;
  }

  // Se não há erros, o teste é bem-sucedido
  result.success = result.errors.length === 0;
  return result;
}

/**
 * Verifica todos os eventos configurados no funil
 * @param funnel O funil a ser verificado
 * @returns Resultados da validação para todos os eventos
 */
export function validateFunnelEvents(funnel: any): FunnelEventsValidationResult {
  const result: FunnelEventsValidationResult = {
    pixelId: funnel?.settings?.facebookPixelId,
    hasPixelConfig: Boolean(funnel?.settings?.facebookPixelId),
    trackingEnabled: {
      pageView: Boolean(funnel?.settings?.pixelTracking?.pageView),
      completeRegistration: Boolean(funnel?.settings?.pixelTracking?.completeRegistration)
    },
    customEvents: [],
    errors: []
  };

  if (!funnel) {
    result.errors.push('Funil não fornecido');
    return result;
  }

  if (!funnel.settings?.facebookPixelId) {
    result.errors.push('ID do Facebook Pixel não configurado');
  }

  // Verificar eventos personalizados em botões
  try {
    // Buscar em todos os passos
    funnel.steps.forEach((step: any, stepIndex: number) => {
      // Verificar elementos de canvas
      if (step.canvasElements && Array.isArray(step.canvasElements)) {
        step.canvasElements.forEach((element: any, elementIndex: number) => {
          if (element.type === 'button' && element.content?.facebookEvent && element.content.facebookEvent !== 'none' && element.content.facebookEvent !== '') {
            // Botão com evento configurado
            result.customEvents.push({
              stepIndex,
              elementIndex,
              eventName: element.content.facebookEvent === 'custom' 
                ? element.content.facebookCustomEventName 
                : element.content.facebookEvent,
              elementType: 'button',
              params: element.content.facebookEventParams || {}
            });
          }
        });
      }
    });
  } catch (error) {
    result.errors.push('Erro ao analisar eventos personalizados: ' + (error as Error).message);
  }

  return result;
}

// Tipos de dados para validação
export interface PixelValidationResult {
  isInstalled: boolean;
  hasTracking: boolean;
  pixelId: string | null;
  errors: string[];
  details: Record<string, any>;
}

export interface PixelEventTestResult {
  success: boolean;
  eventName: string;
  params: any;
  errors: string[];
}

export interface FunnelEventsValidationResult {
  pixelId: string | null;
  hasPixelConfig: boolean;
  trackingEnabled: {
    pageView: boolean;
    completeRegistration: boolean;
  };
  customEvents: Array<{
    stepIndex: number;
    elementIndex: number;
    eventName: string;
    elementType: string;
    params: any;
  }>;
  errors: string[];
}

// Adicionar os tipos ao Window global
declare global {
  interface Window {
    fbq: any;
  }
} 