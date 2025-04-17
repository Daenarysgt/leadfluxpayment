import { ElementRendererProps } from "@/types/canvasTypes";
import BaseElementRenderer from "./BaseElementRenderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useStore } from "@/utils/store";
import { ArrowRight } from "lucide-react";
import { accessService } from "@/services/accessService";
import { safelyTrackEvent } from "@/utils/pixelUtils";

// Função para ajustar uma cor hex, tornando-a mais clara ou escura
const adjustColor = (color: string, amount: number): string => {
  // Remover o # se presente
  color = color.replace('#', '');
  
  // Converter para números
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Ajustar os valores (positivo = mais claro, negativo = mais escuro)
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));
  
  // Converter de volta para hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

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
  const animationType = content.animationType || "none"; // Novo campo para tipo de animação
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
      lg: "h-12 text-lg",
      full: "h-12 w-full"
    };
    
    // Define classes para os diferentes estilos de botão
    const variantClasses = {
      default: "bg-violet-600 hover:bg-violet-700 text-white",
      outline: "border-2 border-violet-600 text-violet-600 hover:bg-violet-50",
      ghost: "hover:bg-violet-50 text-violet-600",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
      link: "underline text-violet-600 hover:text-violet-800",
      gradient: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white",
      "3d": "bg-violet-600 border-b-4 border-violet-800 hover:bg-violet-700 active:border-b-0 active:mb-[4px] text-white",
      neon: "bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_10px_rgba(124,58,237,0.7)]",
      rounded: "bg-violet-600 hover:bg-violet-700 text-white rounded-full"
    };
    
    // Animações
    const animationClasses = {
      none: "",
      pulse: "animate-pulse",
      bounce: "animate-bounce",
      shake: "animate-[wiggle_1s_ease-in-out_infinite]",
      glow: "animate-[glow_1.5s_ease-in-out_infinite]",
      scale: "animate-[scale_1.5s_ease-in-out_infinite]"
    };
    
    return cn(
      baseClasses,
      sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
      variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
      animationEnabled && animationType !== "none" && animationClasses[animationType as keyof typeof animationClasses],
      "flex items-center justify-center gap-2"
    );
  }, [size, variant, animationEnabled, animationType]);

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
          style={{ 
            backgroundColor: variant === "default" ? buttonColor : undefined,
            borderColor: variant === "outline" || variant === "3d" ? buttonColor : undefined,
            color: variant === "outline" || variant === "ghost" || variant === "link" ? buttonColor : undefined,
            // Para variantes específicas, aplicar estilos específicos
            ...(variant === "gradient" ? { 
              background: `linear-gradient(to right, ${buttonColor}, ${adjustColor(buttonColor, 40)})` 
            } : {}),
            ...(variant === "neon" ? { 
              boxShadow: `0 0 10px ${buttonColor}7A` 
            } : {})
          }}
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
