import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useStore } from "@/utils/store";
import { ArrowRight } from "lucide-react";
import { accessService } from "@/services/accessService";
import { safelyTrackEvent } from "@/utils/pixelUtils";

const ButtonRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content = {}, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();
  
  console.log("ButtonRenderer - Rendering with props:", JSON.stringify(element));
  console.log("ButtonRenderer - Preview mode:", previewMode, "Preview props:", previewProps);
  
  const [isVisible, setIsVisible] = useState(!content.delayEnabled);
  
  // Destructure all the configurable properties with defaults
  const buttonText = content.buttonText || "Continuar";
  const alignment = content.alignment || "center";
  const size = content.size || "default";
  const variant = content.variant || "default";
  const buttonColor = content.buttonColor || "#7c3aed"; // Default violet-600
  const animationEnabled = content.animationEnabled || false;
  const delayEnabled = content.delayEnabled || false;
  const delayTime = content.delayTime || 0;
  const navigation = content.navigation || { type: "next" };
  const facebookEvent = content.facebookEvent || "none"; // Evento do Facebook Pixel
  const facebookCustomEventName = content.facebookCustomEventName || ""; // Nome do evento personalizado
  const facebookEventParams = content.facebookEventParams || {}; // Parâmetros do evento
  const facebookEventDebugMode = content.facebookEventDebugMode || false; // Modo de debug
  
  // Effect to handle the appearance delay
  useEffect(() => {
    if (delayEnabled && delayTime > 0) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delayTime);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [delayEnabled, delayTime]);
  
  // Calculate alignment class based on the content.alignment property
  const alignmentClass = useMemo(() => {
    switch (alignment) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  }, [alignment]);

  const buttonClass = useMemo(() => {
    const baseClasses = "w-full transition-all duration-300";
    const sizeClasses = {
      sm: "h-8 text-sm",
      default: "h-10",
      lg: "h-12 text-lg"
    };
    const variantClasses = {
      default: "bg-violet-600 hover:bg-violet-700 text-white",
      outline: "border-2 border-violet-600 text-violet-600 hover:bg-violet-50",
      ghost: "hover:bg-violet-50 text-violet-600"
    };
    
    return cn(
      baseClasses,
      sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
      variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
      animationEnabled && "hover:scale-105",
      "flex items-center justify-center gap-2"
    );
  }, [size, variant, animationEnabled]);

  const performNavigation = async () => {
    console.log("ButtonRenderer - performNavigation called");
    console.log("Navigation config:", navigation);
    
    if (!navigation) return;
    
    // Rastrear evento do Facebook Pixel se configurado
    if (previewMode && facebookEvent && facebookEvent !== "none") {
      // Determinar qual nome de evento usar
      const eventName = facebookEvent === "custom" 
        ? facebookCustomEventName 
        : facebookEvent;
      
      // Não enviar evento personalizado se o nome estiver vazio
      if (facebookEvent === "custom" && !facebookCustomEventName) {
        if (facebookEventDebugMode) {
          console.warn("Facebook Pixel: Nome de evento personalizado não definido");
        }
        return;
      }
      
      // Adicionar feedback visual/log quando estiver em modo de debug
      if (facebookEventDebugMode) {
        console.group("🔍 Facebook Pixel - Evento Disparado");
        console.log("Evento:", eventName);
        console.log("Parâmetros:", facebookEventParams);
        console.groupEnd();

        // Mostrar um toast ou feedback visual aqui se necessário
      }

      safelyTrackEvent(eventName, facebookEventParams);
    }
    
    // Handle navigation differently based on preview mode
    if (previewMode && previewProps) {
      const { activeStep, onStepChange, funnel } = previewProps;
      console.log("Preview mode navigation with activeStep:", activeStep);
      console.log("Total steps:", funnel?.steps?.length);
      
      switch (navigation.type) {
        case "next":
          console.log("Preview mode: Navigate to next step");
          if (funnel && funnel.steps.length > 0) {
            const isLastStep = activeStep === funnel.steps.length - 1;
            console.log("Is last step?", isLastStep);
            
            if (isLastStep) {
              // Se for o último step, registrar o clique e marcar como conversão
              console.log("Registrando conversão para o funil:", funnel.id);
              try {
                // Registrar o clique do botão
                await accessService.registerStepInteraction(
                  funnel.id,
                  Number(activeStep + 1),
                  null,
                  'click'
                );
                // Marcar como conversão
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
                console.log("Conversão registrada com sucesso!");
              } catch (error) {
                console.error("Erro ao registrar conversão:", error);
              }
            } else if (activeStep < funnel.steps.length - 1) {
              onStepChange(activeStep + 1);
            }
          }
          break;
        case "step":
          if (navigation.stepId && funnel) {
            console.log("Preview mode: Navigate to specific step:", navigation.stepId);
            const stepIndex = funnel.steps.findIndex(step => step.id === navigation.stepId);
            if (stepIndex !== -1) {
              const isLastStep = stepIndex === funnel.steps.length - 1;
              console.log("Is last step (specific)?", isLastStep);
              
              if (isLastStep) {
                // Se for o último step, registrar o clique e marcar como conversão
                console.log("Registrando conversão para o funil (specific):", funnel.id);
                try {
                  // Registrar o clique do botão
                  await accessService.registerStepInteraction(
                    funnel.id,
                    Number(stepIndex + 1),
                    null,
                    'click'
                  );
                  // Marcar como conversão
                  await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null, true);
                  console.log("Conversão registrada com sucesso (specific)!");
                } catch (error) {
                  console.error("Erro ao registrar conversão (specific):", error);
                }
              } else {
                onStepChange(stepIndex);
              }
            }
          }
          break;
        case "url":
          if (navigation.url) {
            console.log("Preview mode: Navigate to URL:", navigation.url);
            if (funnel) {
              // Marcar como conversão antes de redirecionar
              console.log("Registrando conversão antes de redirecionar:", funnel.id);
              try {
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
                console.log("Conversão registrada com sucesso (URL)!");
              } catch (error) {
                console.error("Erro ao registrar conversão (URL):", error);
              }
            }
            window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
          }
          break;
      }
    } else {
      // Handle navigation in canvas mode
      switch (navigation.type) {
        case "next":
          if (currentFunnel && currentStep < currentFunnel.steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
          break;
        case "step":
          if (navigation.stepId && currentFunnel) {
            const stepIndex = currentFunnel.steps.findIndex(step => step.id === navigation.stepId);
            if (stepIndex !== -1) {
              setCurrentStep(stepIndex);
            }
          }
          break;
        case "url":
          if (navigation.url) {
            window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
          }
          break;
      }
    }
  };

  if (!isVisible) return null;

  return (
    <BaseElementRenderer {...props}>
      <div className={cn("w-full flex", alignmentClass)}>
        <Button
          className={buttonClass}
          style={{ backgroundColor: buttonColor }}
          onClick={performNavigation}
        >
          {buttonText}
          {navigation.type === "next" && <ArrowRight className="h-4 w-4" />}
          
          {/* Indicador de Facebook Pixel (apenas visível quando for o modo editor) */}
          {!previewMode && facebookEvent && facebookEvent !== "none" && (
            <span className="ml-1.5 text-xs bg-blue-500 text-white px-1 py-0.5 rounded-sm flex items-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 mr-0.5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="currentColor" />
              </svg>
              {facebookEvent === "custom" ? facebookCustomEventName || "Custom" : facebookEvent}
            </span>
          )}
        </Button>
      </div>
    </BaseElementRenderer>
  );
};

export default ButtonRenderer;
