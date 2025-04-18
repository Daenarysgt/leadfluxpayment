import React, { useEffect, useState } from "react";
import { ElementRendererProps } from "@/types/canvasTypes";
import { LoadingElement } from "@/types/elementTypes";
import { Spinner } from "./loading-styles/Spinner";
import { Dots } from "./loading-styles/Dots";
import { Progress } from "./loading-styles/Progress";

const LoadingRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  isSelected, 
  onSelect 
}) => {
  const [progress, setProgress] = useState(0);
  
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
    type = 'next'
  } = navigation;
  
  // Calculate progress step based on redirect delay
  const progressStep = 100 / (redirectDelay * 10); // For 10 updates per second
  
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let redirectTimeout: NodeJS.Timeout;
    
    if (autoRedirect) {
      // Update progress 10 times per second
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + progressStep;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 100);
      
      // Set timeout for redirection
      redirectTimeout = setTimeout(() => {
        // Handle navigation based on type
        if (type === 'next') {
          // Navigate to next step (would require context of current step)
          console.log('Navigate to next step');
          // This would need integration with your funnel navigation system
        } else if (type === 'step' && navigation.stepId) {
          // Navigate to specific step
          console.log('Navigate to step:', navigation.stepId);
          // This would need integration with your funnel navigation system
        } else if (type === 'url' && navigation.url) {
          // Navigate to URL
          if (navigation.openInNewTab) {
            window.open(navigation.url, '_blank');
          } else {
            window.location.href = navigation.url;
          }
        }
      }, redirectDelay * 1000);
    }
    
    // Cleanup function
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [autoRedirect, redirectDelay, type, navigation.stepId, navigation.url, navigation.openInNewTab, progressStep]);
  
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
      className={`p-4 flex flex-col items-center w-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect(element.id)}
    >
      <div className="mb-4">
        {renderLoadingStyle()}
      </div>
      
      {content?.title && (
        <h3 
          className={`text-lg font-medium mb-2 w-full ${alignmentClasses[titleAlignment as keyof typeof alignmentClasses]}`}
          style={{ color: primaryColor }}
        >
          {content.title}
        </h3>
      )}
      
      {content?.description && (
        <p className={`text-sm text-gray-500 w-full ${alignmentClasses[titleAlignment as keyof typeof alignmentClasses]}`}>
          {content.description}
        </p>
      )}
      
      {autoRedirect && (
        <div className="mt-2 text-sm text-muted-foreground">
          Redirecionando em {Math.ceil(redirectDelay - (progress / 100 * redirectDelay))}s...
        </div>
      )}
    </div>
  );
};

export default LoadingRenderer;
