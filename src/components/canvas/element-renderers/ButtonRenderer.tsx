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
  
  // Obter as configurações globais do funil, se disponíveis
  const funnelSettings = element.previewProps?.funnel?.settings || {};
  
  console.log("ButtonRenderer - Rendering with props:", JSON.stringify(element));
  console.log("ButtonRenderer - Preview mode:", previewMode, "Preview props:", previewProps);
  
  const [isVisible, setIsVisible] = useState(!content.delayEnabled);
  
  // Destructure all the configurable properties with defaults
  const buttonText = content.buttonText || content.defaultButtonText || "Continuar";
  const alignment = content.alignment || "center";
  const size = content.size || "default";
  const variant = content.variant || "default";
  const buttonColor = content.buttonColor || funnelSettings.primaryColor || "#7c3aed"; // Use funil primary color as fallback
  const textColor = content.textColor || "#ffffff"; // Default white for text
  const animationEnabled = content.animationEnabled || false;
  const animationType = content.animationType || "none"; // Novo campo para tipo de animação
  const delayEnabled = content.delayEnabled || false;
  const delayTime = content.delayTime || 0;
  const marginTop = content.marginTop || 0;
  const navigation = content.navigation || { type: "next" };
  const facebookEvent = content.facebookEvent || "none"; // Evento do Facebook Pixel
  const facebookCustomEventName = content.facebookCustomEventName || ""; // Nome do evento personalizado
  const facebookEventParams = content.facebookEventParams || {}; // Parâmetros do evento
  const facebookEventDebugMode = content.facebookEventDebugMode || false; // Modo de debug
  // Usar borderRadius específico ou pegar das configurações globais do funil
  const borderRadius = content.borderRadius !== undefined 
    ? content.borderRadius 
    : (funnelSettings.borderRadius ? parseInt(funnelSettings.borderRadius) : 4);
  const fullWidth = content.fullWidth !== false; // Novo campo para definir se o botão ocupa largura total
  
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
    const baseClasses = fullWidth ? "w-full transition-all duration-500" : "transition-all duration-500";
    const sizeClasses = {
      sm: "h-8 text-sm",
      default: "h-10",
      lg: "h-12 text-lg",
      full: "h-12 w-full"
    };
    
    // Define classes para os diferentes estilos de botão
    const variantClasses = {
      default: "hover:opacity-90",
      outline: "border-2 bg-transparent hover:bg-opacity-10",
      ghost: "bg-transparent hover:bg-opacity-10",
      secondary: "bg-gray-200 hover:bg-gray-300",
      link: "bg-transparent underline hover:opacity-80",
      gradient: "hover:opacity-90",
      "3d": "border-b-4 active:border-b-0 active:mb-[4px] hover:opacity-90",
      neon: "hover:opacity-90",
      rounded: "rounded-full hover:opacity-90"
    };
    
    // Animações com duração mais suave
    const animationClasses = {
      none: "",
      pulse: "animate-slow-pulse", // Animação mais suave
      bounce: "animate-slow-bounce", // Animação mais suave
      shake: "animate-[wiggle_2s_ease-in-out_infinite]", // Duração mais longa
      glow: "animate-[glow_2.5s_ease-in-out_infinite]", // Duração mais longa
      scale: "animate-[scale_2.5s_ease-in-out_infinite]" // Duração mais longa
    };
    
    return cn(
      baseClasses,
      sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.default,
      variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
      animationEnabled && animationType !== "none" && animationClasses[animationType as keyof typeof animationClasses],
      "flex items-center justify-center gap-2"
    );
  }, [size, variant, animationEnabled, animationType, fullWidth]);

  const performNavigation = async () => {
    console.log("ButtonRenderer - performNavigation called");
    console.log("Navigation config:", JSON.stringify(navigation));
    
    if (!navigation) {
      console.warn("ButtonRenderer - Nenhuma configuração de navegação definida");
      return;
    }
    
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
      console.log("Tipo de navegação:", navigation.type);
      
      if (!funnel) {
        console.error("Erro: funnel não está definido nos previewProps");
        return;
      }
      
      if (!funnel.steps || !Array.isArray(funnel.steps) || funnel.steps.length === 0) {
        console.error("Erro: funnel.steps não está definido ou está vazio");
        return;
      }
      
      if (typeof onStepChange !== 'function') {
        console.error("Erro: onStepChange não é uma função ou não está definido");
        return;
      }
      
      switch (navigation.type) {
        case "next":
          console.log("Preview mode: Navigate to next step");
          if (funnel && funnel.steps.length > 0) {
            const isLastStep = activeStep === funnel.steps.length - 1;
            console.log("Is last step?", isLastStep);
            
            if (isLastStep) {
              // Se for o último step, apenas marcar como conversão sem registrar interação falsa
              console.log("Último passo - marcando como conversão para o funil:", funnel.id);
              try {
                // Remover o registro automático de clique do botão
                // Marcar como conversão
                await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
                console.log("Conversão registrada com sucesso!");
                
                // Navegar novamente para a última etapa para manter consistência
                console.log("Mantendo navegação na última etapa");
                onStepChange(activeStep);
              } catch (error) {
                console.error("Erro ao registrar conversão:", error);
                // Mesmo com erro, manter na última etapa
                onStepChange(activeStep);
              }
            } else if (activeStep < funnel.steps.length - 1) {
              console.log("Chamando onStepChange para avançar para a próxima etapa:", activeStep + 1);
              onStepChange(activeStep + 1);
            }
          }
          break;
        case "step":
          console.log("Preview mode: Tentando navegar para etapa específica");
          console.log("step ID alvo:", navigation.stepId);
          console.log("Etapas disponíveis:", funnel.steps.map(s => ({ id: s.id, title: s.title })));
          
          if (!navigation.stepId) {
            console.error("Erro: stepId não está definido na configuração de navegação");
            return;
          }
          
          if (funnel) {
            console.log("Preview mode: Navigate to specific step:", navigation.stepId);
            const stepIndex = funnel.steps.findIndex(step => step.id === navigation.stepId);
            console.log("Encontrou índice da etapa:", stepIndex);
            
            if (stepIndex !== -1) {
              const isLastStep = stepIndex === funnel.steps.length - 1;
              console.log("Is last step (specific)?", isLastStep);
              
              if (isLastStep) {
                // Se for o último step, apenas marcar como conversão sem registrar interação falsa
                console.log("Último passo específico - marcando como conversão para o funil:", funnel.id);
                try {
                  // Remover o registro automático de clique do botão
                  // Marcar como conversão
                  await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null, true);
                  console.log("Conversão registrada com sucesso (specific)!");
                  
                  // Navegar para o último passo mesmo assim
                  console.log("Navegando para a última etapa:", stepIndex);
                  onStepChange(stepIndex);
                } catch (error) {
                  console.error("Erro ao registrar conversão (specific):", error);
                  // Mesmo com erro, ainda navegar para o último passo
                  console.log("Navegando para a última etapa mesmo com erro:", stepIndex);
                  onStepChange(stepIndex);
                }
              } else {
                console.log("Executando navegação para o índice de etapa:", stepIndex);
                setTimeout(() => {
                  onStepChange(stepIndex);
                }, 50); // Adicionar pequeno delay para garantir que a navegação seja executada
              }
            } else {
              console.error(`Erro: Não foi possível encontrar a etapa com ID ${navigation.stepId}`);
              console.log("IDs disponíveis:", funnel.steps.map(s => s.id));
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
        default:
          console.error("Tipo de navegação não reconhecido:", navigation.type);
      }
    } else {
      // Handle navigation in canvas mode
      console.log("Canvas mode navigation com tipo:", navigation.type);
      
      switch (navigation.type) {
        case "next":
          console.log("Canvas: Navigate to next step");
          if (currentFunnel && currentStep < currentFunnel.steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
          break;
        case "step":
          console.log("Canvas: Navigate to specific step com stepId:", navigation.stepId);
          if (navigation.stepId && currentFunnel) {
            console.log("Etapas disponíveis no canvas mode:", currentFunnel.steps.map(s => ({ id: s.id, title: s.title })));
            const stepIndex = currentFunnel.steps.findIndex(step => step.id === navigation.stepId);
            console.log("Índice encontrado para o stepId:", stepIndex);
            
            if (stepIndex !== -1) {
              console.log("Mudando para o passo:", stepIndex);
              setCurrentStep(stepIndex);
            } else {
              console.error(`Não foi possível encontrar o passo com ID ${navigation.stepId}`);
            }
          } else {
            console.error("stepId ou currentFunnel não definidos para navegação");
          }
          break;
        case "url":
          console.log("Canvas: Navigate to URL:", navigation.url);
          if (navigation.url) {
            window.open(navigation.url, navigation.openInNewTab ? "_blank" : "_self");
          }
          break;
        default:
          console.error("Tipo de navegação não reconhecido:", navigation.type);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <BaseElementRenderer {...props}>
      <div className={cn("w-full flex", alignmentClass)} style={{ marginTop: `${marginTop}px` }}>
        <Button
          className={buttonClass}
          style={{
            backgroundColor: 
              variant === "default" || variant === "secondary" || variant === "3d" ? buttonColor : 
              variant === "outline" || variant === "ghost" || variant === "link" ? "transparent" : 
              undefined,
            borderColor: variant === "outline" || variant === "3d" ? buttonColor : undefined,
            color: variant === "outline" || variant === "ghost" || variant === "link" ? 
                  buttonColor : 
                  textColor,
            borderRadius: variant === "rounded" ? "9999px" : `${borderRadius}px`, // Usar valor atualizado
            // Para variantes específicas, aplicar estilos específicos
            ...(variant === "gradient" ? { 
              background: `linear-gradient(to right, ${buttonColor}, ${adjustColor(buttonColor, 40)})` 
            } : {}),
            ...(variant === "neon" ? { 
              backgroundColor: buttonColor,
              boxShadow: `0 0 10px ${buttonColor}7A` 
            } : {}),
            ...(variant === "3d" ? {
              borderBottomColor: adjustColor(buttonColor, -30),
              backgroundColor: buttonColor
            } : {}),
            "--hover-color": variant === "outline" || variant === "ghost" ? `${buttonColor}20` : undefined,
            "--glow-color": buttonColor + "80", // Adicionar variável de cor para a animação glow (com 50% de opacidade)
          } as React.CSSProperties}
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
