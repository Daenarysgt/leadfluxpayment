import { cn } from "@/lib/utils";
import { ElementRendererProps } from "@/types/canvasTypes";
import { useStore } from "@/utils/store";
import { ChevronRight, ImageIcon } from "lucide-react";
import BaseElementRenderer from "./BaseElementRenderer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useCallback, useMemo } from "react";
import { accessService } from "@/services/accessService";

const MultipleChoiceImageRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel } = useStore();
  
  // Define all hooks consistently at the top level
  const handleOptionClick = useCallback(async (option: any) => {
    if (!option.navigation) return;
    
    const navigationType = option.navigation.type;
    
    // Se for tipo "none", não realiza navegação
    if (navigationType === "none") {
      console.log("Navegação do tipo 'none' - nenhuma ação será executada");
      return;
    }
    
    // Handle navigation differently based on preview mode
    if (previewMode && previewProps) {
      const { activeStep, onStepChange, funnel } = previewProps;
      
      console.log("MultipleChoiceImageRenderer - Option clicked:", option);
      console.log("Option text:", option.text);
      
      // Registrar a interação com o valor selecionado
      if (funnel) {
        const interactionValue = option.text || option.value || "Nova opção";
        console.log("Registering interaction with value:", interactionValue);
        
        await accessService.registerStepInteraction(
          funnel.id,
          Number(activeStep + 1),
          null,
          'choice',
          interactionValue
        );
      }
      
      if (navigationType === "next") {
        console.log("Preview mode: Navigate to next step");
        if (funnel && activeStep < funnel.steps.length - 1) {
          // Atualizar progresso antes de mudar de step
          await accessService.updateProgress(funnel.id, Number(activeStep + 1), null);
          onStepChange(activeStep + 1);
        } else if (funnel && activeStep === funnel.steps.length - 1) {
          // Se for o último step, marcar como conversão
          await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
        }
      }
      else if (navigationType === "step" && option.navigation.stepId) {
        console.log("Preview mode: Navigate to specific step:", option.navigation.stepId);
        if (funnel) {
          const stepIndex = funnel.steps.findIndex(step => step.id === option.navigation.stepId);
          if (stepIndex !== -1) {
            // Atualizar progresso antes de mudar de step
            await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null);
            if (stepIndex === funnel.steps.length - 1) {
              // Se for o último step, marcar como conversão
              await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null, true);
            } else {
              onStepChange(stepIndex);
            }
          }
        }
      }
      else if (navigationType === "url" && option.navigation.url) {
        console.log("Preview mode: Open external URL:", option.navigation.url);
        if (funnel) {
          // Marcar como conversão antes de redirecionar
          await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
        }
        window.open(option.navigation.url, option.navigation.openInNewTab ? "_blank" : "_self");
      }
    } else {
      // Regular builder mode navigation
      if (navigationType === "next") {
        console.log("Navigate to next step");
        if (currentFunnel) {
          const currentStepIndex = currentFunnel.steps.findIndex(step => 
            step.canvasElements.some(el => el.id === element.id)
          );
          if (currentStepIndex !== -1 && currentStepIndex < currentFunnel.steps.length - 1) {
            setCurrentStep(currentStepIndex + 1);
          }
        }
      }
      else if (navigationType === "step" && option.navigation.stepId) {
        console.log("Navigate to specific step:", option.navigation.stepId);
        if (currentFunnel) {
          const stepIndex = currentFunnel.steps.findIndex(step => step.id === option.navigation.stepId);
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
          } else {
            console.error("Step ID not found:", option.navigation.stepId);
          }
        }
      }
      else if (navigationType === "url" && option.navigation.url) {
        console.log("Open external URL:", option.navigation.url);
        window.open(option.navigation.url, option.navigation.openInNewTab ? "_blank" : "_self");
      }
    }
  }, [setCurrentStep, currentFunnel, element.id, previewMode, previewProps]);

  // Function to get the aspect ratio value - memoized
  const getAspectRatioValue = useCallback((aspectRatio: string | undefined): number | undefined => {
    switch (aspectRatio) {
      case "16:9":
        return 16/9;
      case "9:16":
        return 9/16;
      case "4:3":
        return 4/3;
      case "1:1":
        return 1;
      case "original":
        return undefined;
      default:
        return 1;
    }
  }, []);
  
  // Memoize the options rendering to improve performance
  const renderedOptions = useMemo(() => {
    return content?.options ? content.options.map((option) => {
      const optionStyle = option.style || {};
      const backgroundColor = optionStyle.backgroundColor || "#0F172A";
      const aspectRatio = optionStyle.aspectRatio || "1:1";
      const ratio = getAspectRatioValue(aspectRatio);
      
      return (
        <div 
          key={option.id} 
          className="rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.03]"
          onClick={() => handleOptionClick(option)}
        >
          <div className="relative">
            {aspectRatio !== "original" && ratio ? (
              <AspectRatio ratio={ratio} className="w-full">
                {option.image ? (
                  <img 
                    src={option.image} 
                    alt={option.text} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
              </AspectRatio>
            ) : (
              <div className="relative">
                {option.image ? (
                  <img 
                    src={option.image} 
                    alt={option.text} 
                    className="w-full object-contain" 
                  />
                ) : (
                  <div className="h-40 w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
              </div>
            )}
            <div 
              className="p-3 flex justify-between items-center"
              style={{ backgroundColor }}
            >
              <span className="text-white font-medium">{option.text}</span>
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      );
    }) : null;
  }, [content?.options, getAspectRatioValue, handleOptionClick]);
  
  // Calcular o estilo para margem superior
  const marginTopValue = content?.marginTop ? content.marginTop : 0;
  
  // Aplicar a margem superior como uma propriedade CSS personalizada para evitar sobrescritas
  const containerStyle = {
    '--element-margin-top': `${marginTopValue}px`,
  } as React.CSSProperties;
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4 preserve-margin-top" style={containerStyle}>
        {content?.title && (
          <h2 className="text-xl font-semibold text-center mb-4">{content.title}</h2>
        )}
        <div className="grid grid-cols-2 gap-4">
          {renderedOptions}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default MultipleChoiceImageRenderer;
