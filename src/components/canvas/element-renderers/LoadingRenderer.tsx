import React, { useEffect, useState, useRef } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { LoadingElement } from "@/types/elementTypes";
import { Spinner } from "./loading-styles/Spinner";
import { Dots } from "./loading-styles/Dots";
import { Progress } from "./loading-styles/Progress";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import BaseElementRenderer from "./BaseElementRenderer";

const LoadingRenderer: React.FC<ElementRendererProps> = (props) => {
  const { element, isSelected, onSelect } = props;
  const [progress, setProgress] = useState(0);
  const [redirectStatus, setRedirectStatus] = useState<'waiting' | 'ready' | 'redirecting'>('waiting');
  const { navigateToNextStep, navigateToStep } = useStepNavigation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Verificar se estamos no modo de preview
  const isPreview = element.previewMode === true;
  
  const content = element.content as LoadingElement;
  const style = content?.style || {};
  const navigation = content?.navigation || {};
  
  const { 
    loadingStyle = 'spinner', 
    primaryColor = '#8B5CF6', 
    size = 'medium',
    titleAlignment = 'center'
  } = style;
  
  const {
    autoRedirect = false,
    redirectDelay = 3,
    type = 'next',
    showRedirectText = true
  } = navigation;
  
  // Calculate progress step based on redirect delay
  const progressStep = 100 / (redirectDelay * 10); // For 10 updates per second
  
  // Calcular o tempo restante com base no progresso
  const remainingSeconds = Math.ceil(redirectDelay - (progress / 100 * redirectDelay));
  
  // Função para navegar usando as funções de preview quando disponíveis
  const handleNavigation = () => {
    // Verificar se temos funções de navegação através do previewProps
    if (isPreview && element.previewProps) {
      const { onStepChange, activeStep, funnel } = element.previewProps;
      
      if (type === 'next' && onStepChange) {
        // Navegar para a próxima etapa
        console.log('Navegando para a próxima etapa via previewProps');
        onStepChange(activeStep + 1);
        return true;
      } else if (type === 'step' && navigation.stepId && onStepChange && funnel) {
        // Encontrar o índice da etapa pelo ID
        const stepIndex = funnel.steps?.findIndex(step => step.id === navigation.stepId);
        if (stepIndex !== -1 && stepIndex !== undefined) {
          console.log('Navegando para a etapa específica via previewProps', stepIndex);
          onStepChange(stepIndex);
          return true;
        }
      }
    }
    
    // Usar o hook de navegação se as funções de preview não estiverem disponíveis
    if (type === 'next') {
      console.log('Navegando para a próxima etapa via hook');
      return navigateToNextStep();
    } else if (type === 'step' && navigation.stepId) {
      console.log('Navegando para a etapa específica via hook', navigation.stepId);
      return navigateToStep(navigation.stepId);
    } else if (type === 'url' && navigation.url) {
      console.log('Navegando para URL', navigation.url);
      
      // Função melhorada para redirecionamento de URL compatível com dispositivos móveis
      const redirectToUrl = (url: string, newTab: boolean) => {
        try {
          if (newTab) {
            // Método 1: Abrir em nova aba
            window.open(url, '_blank');
          } else {
            // Método 1: Redirecionamento usando location.href
            window.location.href = url;
            
            // Método 2: Abrir na mesma aba usando window.open (melhor para mobile)
            setTimeout(() => {
              if (document.location.href !== url) {
                window.open(url, '_self');
              }
            }, 100);
            
            // Método 3: Fallback - criar e clicar em um link programaticamente
            setTimeout(() => {
              if (document.location.href !== url) {
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('target', '_self');
                link.setAttribute('rel', 'noopener noreferrer');
                document.body.appendChild(link);
                link.click();
                setTimeout(() => document.body.removeChild(link), 100);
              }
            }, 300);
          }
        } catch (error) {
          console.error('Erro ao redirecionar:', error);
          // Último recurso: alert com a URL
          alert(`Por favor, acesse manualmente: ${url}`);
        }
      };
      
      redirectToUrl(navigation.url, navigation.openInNewTab || false);
      return true;
    }
    
    return false;
  };
  
  // Permite que o usuário clique no elemento para forçar o redirecionamento
  const handleManualRedirect = () => {
    if (isPreview && autoRedirect && redirectStatus !== 'redirecting') {
      setRedirectStatus('redirecting');
      // Atualizar o progresso para 100% visualmente
      setProgress(100);
      // Executar redirecionamento com pequeno delay para feedback visual
      setTimeout(() => {
        handleNavigation();
      }, 150);
    }
  };
  
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let redirectTimeout: NodeJS.Timeout;
    let redirectTriggered = false;
    
    // Só executar a navegação automática no modo de preview
    if (autoRedirect && isPreview) {
      // Update progress 10 times per second
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + progressStep;
          // Quando atingir 100%, acionamos o redirecionamento
          if (newProgress >= 100 && !redirectTriggered) {
            redirectTriggered = true;
            // Pequeno delay para garantir que o usuário veja 100% antes do redirecionamento
            setTimeout(() => {
              handleNavigation();
            }, 200);
            return 100;
          }
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 100);
    } else {
      // No modo de edição, mostrar progresso simulado
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          // No modo de edição, ciclamos o progresso de 0 a 100% repetidamente
          const newProgress = prev + 1;
          return newProgress > 100 ? 0 : newProgress;
        });
      }, 100);
    }
    
    // Adicionar um evento de escuta de toque para dispositivos móveis
    const containerElement = containerRef.current;
    if (containerElement && isPreview && autoRedirect) {
      const touchStartListener = () => {
        if (redirectStatus !== 'redirecting') {
          setRedirectStatus('redirecting');
          handleManualRedirect();
        }
      };
      
      containerElement.addEventListener('touchstart', touchStartListener);
      containerElement.addEventListener('click', touchStartListener);
      
      return () => {
        containerElement.removeEventListener('touchstart', touchStartListener);
        containerElement.removeEventListener('click', touchStartListener);
        if (progressInterval) clearInterval(progressInterval);
        if (redirectTimeout) clearTimeout(redirectTimeout);
      };
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [
    autoRedirect, 
    redirectDelay, 
    type, 
    navigation.stepId, 
    navigation.url, 
    navigation.openInNewTab, 
    progressStep, 
    isPreview,
    redirectStatus
  ]);
  
  const renderLoadingStyle = () => {
    switch (loadingStyle) {
      case 'spinner':
        return <Spinner color={primaryColor} size={size} />;
      case 'dots':
        return <Dots color={primaryColor} size={size} />;
      case 'progress':
        return <Progress color={primaryColor} size={size} progress={progress} />;
      default:
        return <Spinner color={primaryColor} size={size} />;
    }
  };
  
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <BaseElementRenderer {...props}>
      <div 
        ref={containerRef}
        className={`p-6 flex flex-col items-center w-full ${isPreview && autoRedirect ? 'cursor-pointer' : ''}`}
        onClick={isPreview && autoRedirect ? handleManualRedirect : undefined}
      >
        <div className="mb-6 w-full max-w-md mx-auto">
          {renderLoadingStyle()}
        </div>
        
        {content?.title && (
          <h3 
            className={`text-xl font-semibold mb-3 w-full ${alignmentClasses[titleAlignment as keyof typeof alignmentClasses]}`}
            style={{ color: primaryColor }}
          >
            {content.title}
          </h3>
        )}
        
        {content?.description && (
          <p className={`text-base text-gray-600 w-full mb-4 ${alignmentClasses[titleAlignment as keyof typeof alignmentClasses]}`}>
            {content.description}
          </p>
        )}
        
        {autoRedirect && showRedirectText && redirectStatus !== 'redirecting' && (
          <div className="mt-3 text-base font-medium py-2" style={{ color: primaryColor }}>
            Redirecionando em <span className="font-bold text-lg">{remainingSeconds}s</span>...
          </div>
        )}
        
        {autoRedirect && redirectStatus === 'redirecting' && (
          <div className="mt-3 text-base font-medium py-2 animate-pulse" style={{ color: primaryColor }}>
            Redirecionando agora...
          </div>
        )}
        
        {isPreview && autoRedirect && (
          <div className="mt-4 text-xs text-gray-400">
            Toque para avançar imediatamente
          </div>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default LoadingRenderer;
