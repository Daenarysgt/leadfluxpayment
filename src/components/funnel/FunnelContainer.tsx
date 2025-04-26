import React, { useEffect, useState } from 'react';
import { Funnel } from '@/utils/types';
import FunnelPreview from '../funnel-preview/FunnelPreview';
import imagePreloader from '@/utils/imagePreloader';

interface FunnelContainerProps {
  funnel: Funnel;
  initialStep?: number;
  isMobile?: boolean;
}

const FunnelContainer: React.FC<FunnelContainerProps> = ({
  funnel,
  initialStep = 0,
  isMobile = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Pré-carregar todas as imagens do funil quando o componente montar
  useEffect(() => {
    let isMounted = true;
    
    const preloadAllImages = async () => {
      if (!funnel) return;
      
      setIsLoading(true);
      setLoadingProgress(0);
      
      try {
        // Extrair todas as URLs de imagens
        const allImageUrls: string[] = [];
        
        // Incluir logo e imagem de fundo
        if (funnel.settings?.logo) allImageUrls.push(funnel.settings.logo);
        if (funnel.settings?.backgroundImage) allImageUrls.push(funnel.settings.backgroundImage);
        
        // Extrair URLs de imagens de todas as etapas
        let totalImages = 0;
        funnel.steps.forEach(step => {
          if (step?.canvasElements) {
            const stepImages = imagePreloader.extractImageUrls(step.canvasElements);
            allImageUrls.push(...stepImages);
            totalImages += stepImages.length;
          }
        });
        
        if (allImageUrls.length === 0) {
          // Se não houver imagens, finalize o carregamento imediatamente
          if (isMounted) {
            setIsLoading(false);
            setLoadingProgress(100);
          }
          return;
        }
        
        // Contadores para acompanhar o progresso
        let loadedImages = 0;
        
        // Pré-carregar cada imagem individualmente para rastrear o progresso
        const uniqueUrls = [...new Set(allImageUrls)];
        
        uniqueUrls.forEach(url => {
          const img = new Image();
          
          img.onload = () => {
            if (!isMounted) return;
            
            loadedImages++;
            const progress = Math.round((loadedImages / uniqueUrls.length) * 100);
            setLoadingProgress(progress);
            
            // Quando todas as imagens estiverem carregadas
            if (loadedImages === uniqueUrls.length) {
              setIsLoading(false);
            }
          };
          
          img.onerror = () => {
            if (!isMounted) return;
            
            loadedImages++;
            const progress = Math.round((loadedImages / uniqueUrls.length) * 100);
            setLoadingProgress(progress);
            
            // Quando todas as imagens estiverem carregadas (mesmo com erros)
            if (loadedImages === uniqueUrls.length) {
              setIsLoading(false);
            }
          };
          
          img.src = url;
        });
        
        // Se não houver imagens para carregar, finalize
        if (uniqueUrls.length === 0) {
          setIsLoading(false);
          setLoadingProgress(100);
        }
      } catch (error) {
        console.error("Erro ao pré-carregar imagens do funil:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    preloadAllImages();
    
    return () => {
      isMounted = false;
    };
  }, [funnel]);

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  // Renderização condicional com base no estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-6">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <h3 className="text-lg font-medium">Carregando {funnel.name || 'funil'}</h3>
            <p className="text-sm text-gray-500">Preparando conteúdo para melhor experiência...</p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500 text-center">{loadingProgress}%</p>
        </div>
      </div>
    );
  }

  return (
    <FunnelPreview 
      funnel={funnel} 
      isMobile={isMobile} 
      stepIndex={currentStep}
      onNextStep={handleStepChange}
    />
  );
};

export default FunnelContainer; 