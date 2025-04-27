import { useState, useEffect } from 'react';
import { Funnel } from '@/utils/types';

/**
 * Hook para pré-carregar imagens das etapas do funil
 * @param funnel O funil que contém as etapas com imagens
 * @param currentStepIndex O índice da etapa atual
 * @returns Um objeto indicando o status do pré-carregamento
 */
const useImagePreloader = (funnel: Funnel | null | undefined, currentStepIndex: number) => {
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(false);

  // Função para extrair URLs de imagens de elementos do canvas
  const extractImageUrls = (elements: any[] = []): string[] => {
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

  // Função para pré-carregar um array de URLs de imagens
  const preloadImages = async (imageUrls: string[]): Promise<void> => {
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

  useEffect(() => {
    if (!funnel || !Array.isArray(funnel.steps) || funnel.steps.length === 0 || isPreloading) {
      return;
    }

    const preloadNextSteps = async () => {
      setIsPreloading(true);
      setImagesPreloaded(false);

      try {
        // Determinar as próximas etapas a pré-carregar
        const nextStepIndex = currentStepIndex + 1;
        const nextNextStepIndex = currentStepIndex + 2;
        
        // Array para armazenar todas as URLs de imagens a serem pré-carregadas
        const imagesToPreload: string[] = [];

        // Pré-carregar a próxima etapa (prioridade alta)
        if (nextStepIndex < funnel.steps.length) {
          const nextStepElements = funnel.steps[nextStepIndex]?.canvasElements || [];
          imagesToPreload.push(...extractImageUrls(nextStepElements));
        }

        // Pré-carregar a etapa seguinte (prioridade média)
        if (nextNextStepIndex < funnel.steps.length) {
          const nextNextStepElements = funnel.steps[nextNextStepIndex]?.canvasElements || [];
          imagesToPreload.push(...extractImageUrls(nextNextStepElements));
        }

        // Pré-carregar as imagens
        if (imagesToPreload.length > 0) {
          await preloadImages(imagesToPreload);
        }

        setImagesPreloaded(true);
      } catch (error) {
        console.error('[ImagePreloader] Erro durante o pré-carregamento:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    // Iniciar o pré-carregamento
    preloadNextSteps();
  }, [funnel, currentStepIndex]);

  return { imagesPreloaded, isPreloading };
};

export default useImagePreloader; 