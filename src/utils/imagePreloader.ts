import { Funnel } from './types';

/**
 * Extrai URLs de imagens dos elementos do canvas
 * @param elements Elementos do canvas da etapa
 * @returns Array de URLs de imagens
 */
export const extractImageUrls = (elements: any[] = []): string[] => {
  if (!Array.isArray(elements)) return [];
  
  return elements.reduce((urls: string[], element) => {
    if (element?.type === 'image' && element?.content?.imageUrl) {
      // Verificar se a URL é válida e não é um placeholder
      const imageUrl = element.content.imageUrl;
      if (imageUrl && typeof imageUrl === 'string' && !imageUrl.includes('placeholder')) {
        urls.push(imageUrl);
      }
    }
    return urls;
  }, []);
};

/**
 * Pré-carrega um array de URLs de imagens
 * @param imageUrls Array de URLs de imagens para pré-carregar
 * @returns Promise que resolve quando todas as imagens estiverem carregadas
 */
export const preloadImages = async (imageUrls: string[]): Promise<void> => {
  if (!imageUrls.length) return;
  
  const uniqueUrls = [...new Set(imageUrls)]; // Remover duplicatas
  
  const preloadPromises = uniqueUrls.map(url => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Falha ao pré-carregar imagem: ${url}`);
        resolve(); // Resolve mesmo com erro para não bloquear outras imagens
      };
      img.src = url;
    });
  });

  try {
    await Promise.all(preloadPromises);
    console.log(`[ImagePreloader] ${uniqueUrls.length} imagens pré-carregadas com sucesso`);
  } catch (error) {
    console.error('[ImagePreloader] Erro ao pré-carregar imagens:', error);
  }
};

/**
 * Pré-carrega todas as imagens de um funil
 * @param funnel O funil que contém as etapas com imagens para pré-carregar
 * @returns Promise que resolve quando todas as imagens estiverem carregadas
 */
export const preloadAllFunnelImages = async (funnel: Funnel | null | undefined): Promise<void> => {
  if (!funnel || !Array.isArray(funnel.steps) || funnel.steps.length === 0) {
    console.warn('[ImagePreloader] Funil inválido para pré-carregamento');
    return;
  }
  
  console.log(`[ImagePreloader] Iniciando pré-carregamento de imagens para o funil: ${funnel.name || funnel.id}`);
  
  try {
    // Extrair todas as URLs de imagens de todas as etapas
    const allImageUrls: string[] = [];
    
    // Incluir o logo se existir
    if (funnel.settings?.logo && typeof funnel.settings.logo === 'string') {
      allImageUrls.push(funnel.settings.logo);
    }
    
    // Incluir imagem de fundo se existir
    if (funnel.settings?.backgroundImage && typeof funnel.settings.backgroundImage === 'string') {
      allImageUrls.push(funnel.settings.backgroundImage);
    }
    
    // Extrair URLs de imagens de todas as etapas
    funnel.steps.forEach(step => {
      if (step?.canvasElements) {
        const stepImageUrls = extractImageUrls(step.canvasElements);
        allImageUrls.push(...stepImageUrls);
      }
    });
    
    // Pré-carregar todas as imagens
    if (allImageUrls.length > 0) {
      console.log(`[ImagePreloader] Pré-carregando ${allImageUrls.length} imagens do funil`);
      await preloadImages(allImageUrls);
    } else {
      console.log('[ImagePreloader] Nenhuma imagem encontrada para pré-carregamento');
    }
  } catch (error) {
    console.error('[ImagePreloader] Erro durante o pré-carregamento de imagens do funil:', error);
  }
};

export default {
  extractImageUrls,
  preloadImages,
  preloadAllFunnelImages
}; 