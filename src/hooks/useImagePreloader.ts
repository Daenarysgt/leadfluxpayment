import { useState, useEffect } from 'react';
import { Funnel } from '@/utils/types';

/**
 * Hook para pré-carregar imagens das etapas do funil
 * @param funnel O funil que contém as etapas com imagens
 * @param currentStepIndex O índice da etapa atual
 * @param renderAllSteps Se true, todas as etapas são renderizadas juntas
 * @returns Um objeto indicando o status do pré-carregamento
 */
const useImagePreloader = (
  funnel: Funnel | null | undefined, 
  currentStepIndex: number,
  renderAllSteps: boolean = false
) => {
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [loadedSteps, setLoadedSteps] = useState<number[]>([]);

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
  const preloadImages = async (imageUrls: string[], priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> => {
    if (!imageUrls.length) return;
    
    const uniqueUrls = [...new Set(imageUrls)]; // Remover duplicatas
    
    // Definir timeout com base na prioridade
    const timeout = priority === 'high' ? 0 : 
                   priority === 'medium' ? 500 : 2000;
    
    // Atrasar imagens de baixa prioridade para permitir que imagens de alta prioridade carreguem primeiro
    await new Promise(resolve => setTimeout(resolve, timeout));
    
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
      console.log(`[ImagePreloader] ${uniqueUrls.length} imagens pré-carregadas com prioridade ${priority}`);
    } catch (error) {
      console.error('[ImagePreloader] Erro ao pré-carregar imagens:', error);
    }
  };

  useEffect(() => {
    if (!funnel || !Array.isArray(funnel.steps) || funnel.steps.length === 0 || isPreloading) {
      return;
    }

    const preloadStepImages = async () => {
      setIsPreloading(true);

      try {
        // Se renderAllSteps é true, precisamos priorizar as imagens de forma diferente
        if (renderAllSteps) {
          // 1. Carregar imagens da etapa atual primeiro (alta prioridade)
          const currentStep = funnel.steps[currentStepIndex];
          if (currentStep && !loadedSteps.includes(currentStepIndex)) {
            const currentStepElements = currentStep.canvasElements || [];
            const currentStepImages = extractImageUrls(currentStepElements);
            
            if (currentStepImages.length > 0) {
              await preloadImages(currentStepImages, 'high');
              setLoadedSteps(prev => [...prev, currentStepIndex]);
            }
          }
          
          // 2. Carregar imagens das próximas etapas visíveis (média prioridade)
          // Considerar as 3 próximas etapas como potencialmente visíveis
          const nextVisibleSteps = Array.from(
            { length: 3 }, 
            (_, i) => currentStepIndex + i + 1
          ).filter(idx => idx < funnel.steps.length && !loadedSteps.includes(idx));
          
          for (const stepIdx of nextVisibleSteps) {
            const step = funnel.steps[stepIdx];
            if (step) {
              const stepElements = step.canvasElements || [];
              const stepImages = extractImageUrls(stepElements);
              
              if (stepImages.length > 0) {
                // Use a função separada para cada etapa, para permitir priorização
                preloadImages(stepImages, 'medium').then(() => {
                  setLoadedSteps(prev => [...prev, stepIdx]);
                });
              } else {
                setLoadedSteps(prev => [...prev, stepIdx]);
              }
            }
          }
          
          // 3. Carregar o resto das etapas com baixa prioridade (em segundo plano)
          const remainingSteps = Array.from(
            { length: funnel.steps.length }, 
            (_, i) => i
          ).filter(idx => !loadedSteps.includes(idx) && !nextVisibleSteps.includes(idx) && idx !== currentStepIndex);
          
          // Iniciar carregamento em segundo plano
          for (const stepIdx of remainingSteps) {
            const step = funnel.steps[stepIdx];
            if (step) {
              const stepElements = step.canvasElements || [];
              const stepImages = extractImageUrls(stepElements);
              
              if (stepImages.length > 0) {
                // Use a função separada para cada etapa, para permitir priorização
                preloadImages(stepImages, 'low').then(() => {
                  setLoadedSteps(prev => [...prev, stepIdx]);
                });
              } else {
                setLoadedSteps(prev => [...prev, stepIdx]);
              }
            }
          }
        } else {
          // Comportamento original para carregamento sequencial de etapas
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
            await preloadImages(imagesToPreload, 'high');
          }
        }

        setImagesPreloaded(true);
      } catch (error) {
        console.error('[ImagePreloader] Erro durante o pré-carregamento:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    // Iniciar o pré-carregamento
    preloadStepImages();
  }, [funnel, currentStepIndex, loadedSteps, renderAllSteps, isPreloading]);

  return { imagesPreloaded, isPreloading };
};

export default useImagePreloader; 