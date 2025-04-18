import React, { useEffect, useState } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { LoadingElement } from "@/types/elementTypes";
import { Spinner } from "./loading-styles/Spinner";
import { Dots } from "./loading-styles/Dots";
import { Progress } from "./loading-styles/Progress";
import { useStepNavigation } from "@/hooks/useStepNavigation";

const LoadingRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  isSelected, 
  onSelect
}) => {
  const [progress, setProgress] = useState(0);
  const { navigateToNextStep, navigateToStep } = useStepNavigation();
  
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
      if (navigation.openInNewTab) {
        window.open(navigation.url, '_blank');
      } else {
        window.location.href = navigation.url;
      }
      return true;
    }
    
    return false;
  };
  
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let redirectTimeout: NodeJS.Timeout;
    
    // Só executar a navegação automática no modo de preview
    if (autoRedirect && isPreview) {
      // Update progress 10 times per second
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + progressStep;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 100);
      
      // Set timeout for redirection
      redirectTimeout = setTimeout(() => {
        handleNavigation();
      }, redirectDelay * 1000);
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
    
    // Cleanup function
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
    isPreview
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
    <div 
      className={`p-6 flex flex-col items-center w-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect(element.id)}
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
      
      {autoRedirect && showRedirectText && (
        <div className="mt-3 text-base font-medium py-2" style={{ color: primaryColor }}>
          Redirecionando em <span className="font-bold text-lg">{Math.ceil(redirectDelay - (progress / 100 * redirectDelay))}s</span>...
        </div>
      )}
    </div>
  );
};

export default LoadingRenderer;
