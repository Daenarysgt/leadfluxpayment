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
  
  // Obter as configurações globais do funil, se disponíveis
  const funnelSettings = element.previewProps?.funnel?.settings || {};
  
  // Obter configurações globais de tipografia
  const fontFamily = funnelSettings.fontFamily || 'Inter';
  const headingSize = funnelSettings.headingSize ? parseInt(funnelSettings.headingSize) : 24;
  const bodySize = funnelSettings.bodySize ? parseInt(funnelSettings.bodySize) : 16;
  const lineHeight = funnelSettings.lineHeight ? parseFloat(funnelSettings.lineHeight) : 1.5;
  const fontStyle = funnelSettings.textItalic ? 'italic' : 'normal';
  const fontWeight = funnelSettings.textBold ? 'bold' : 'normal';
  const textDecoration = funnelSettings.textUnderline ? 'underline' : 'none';
  const textTransform = funnelSettings.textUppercase ? 'uppercase' : 'none';
  
  // Obter configurações globais de layout
  const borderRadiusValue = content?.style?.borderRadius !== undefined 
    ? content.style.borderRadius 
    : (funnelSettings.borderRadius ? parseInt(funnelSettings.borderRadius) : 8);
  
  // Define all hooks consistently at the top level
  const handleOptionClick = useCallback(async (option: any) => {
    console.log("MultipleChoiceImageRenderer - Opção clicada:", option);
    
    if (!option.navigation) {
      console.warn("Opção sem configuração de navegação:", option.text);
      return;
    }
    
    const navigationType = option.navigation.type;
    console.log("Tipo de navegação:", navigationType, "Configuração completa:", option.navigation);
    
    // Se for tipo "none", não realiza navegação
    if (navigationType === "none") {
      console.log("Navegação do tipo 'none' - nenhuma ação será executada");
      return;
    }
    
    // Handle navigation differently based on preview mode
    if (previewMode && previewProps) {
      try {
        const { activeStep, onStepChange, funnel } = previewProps;
        console.log("Preview props:", { activeStep, funnel: funnel?.id, totalSteps: funnel?.steps?.length });
        
        // Registrar a interação com o valor selecionado
        if (funnel) {
          const interactionValue = option.text || option.value || "Nova opção";
          console.log("Registrando interação com valor:", interactionValue, "para funil:", funnel.id, "etapa:", activeStep + 1);
          
          await accessService.registerStepInteraction(
            funnel.id,
            Number(activeStep + 1),
            null,
            'choice',
            interactionValue
          );
          
          console.log(`Interação da imagem registrada com sucesso: "${interactionValue}" na etapa ${activeStep + 1}`);
          
          // Executar a navegação baseada no tipo
          if (navigationType === "next") {
            console.log("Navegação para próxima etapa. Atual:", activeStep, "Total:", funnel.steps.length);
            if (funnel && activeStep < funnel.steps.length - 1) {
              // Atualizar progresso antes de mudar de step
              console.log("Atualizando progresso para etapa:", activeStep + 1);
              await accessService.updateProgress(funnel.id, Number(activeStep + 1), null);
              
              // Pequeno atraso para garantir que as operações do banco de dados foram concluídas
              console.log("Navegando para próxima etapa:", activeStep + 1);
              setTimeout(() => onStepChange(activeStep + 1), 200);
            } else if (funnel && activeStep === funnel.steps.length - 1) {
              // Se for o último step, marcar como conversão
              console.log("Última etapa - marcando como conversão");
              await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
            }
          }
          else if (navigationType === "step" && option.navigation.stepId) {
            console.log("Navegação para etapa específica:", option.navigation.stepId);
            if (funnel) {
              const stepIndex = funnel.steps.findIndex(step => step.id === option.navigation.stepId);
              console.log("Índice da etapa encontrado:", stepIndex, "de total:", funnel.steps.length);
              
              if (stepIndex !== -1) {
                // Atualizar progresso antes de mudar de step
                console.log("Atualizando progresso para etapa específica:", stepIndex + 1);
                await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null);
                
                if (stepIndex === funnel.steps.length - 1) {
                  // Se for o último step, marcar como conversão
                  console.log("Última etapa (específica) - marcando como conversão");
                  await accessService.updateProgress(funnel.id, Number(stepIndex + 1), null, true);
                }
                
                // Navegar com um pequeno atraso
                console.log("Navegando para etapa específica:", stepIndex);
                setTimeout(() => onStepChange(stepIndex), 200);
              } else {
                console.error("Etapa não encontrada com ID:", option.navigation.stepId);
              }
            }
          }
          else if (navigationType === "url" && option.navigation.url) {
            console.log("Navegação para URL externa:", option.navigation.url);
            if (funnel) {
              // Marcar como conversão antes de redirecionar
              console.log("Marcando como conversão antes de redirecionar");
              await accessService.updateProgress(funnel.id, Number(activeStep + 1), null, true);
            }
            
            // Abrir a URL
            console.log("Redirecionando para:", option.navigation.url, "Nova aba:", option.navigation.openInNewTab);
            window.open(option.navigation.url, option.navigation.openInNewTab ? "_blank" : "_self");
          }
        } else {
          console.warn("Objeto funnel não disponível em previewProps");
        }
      } catch (error) {
        console.error("Erro durante navegação com imagem:", error);
      }
    } else {
      // Regular builder mode navigation
      console.log("Modo Canvas - navegação simulada apenas");
      
      if (navigationType === "next") {
        console.log("Navegar para próxima etapa (modo canvas)");
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
        console.log("Navegar para etapa específica (modo canvas):", option.navigation.stepId);
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
        console.log("Abrir URL externa (modo canvas):", option.navigation.url);
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
      const backgroundColor = optionStyle.backgroundColor || funnelSettings.primaryColor || "#0F172A";
      const aspectRatio = optionStyle.aspectRatio || "1:1";
      const ratio = getAspectRatioValue(aspectRatio);
      
      return (
        <div 
          key={option.id} 
          className="overflow-hidden cursor-pointer transition-all hover:scale-[1.03]"
          style={{ borderRadius: `${borderRadiusValue}px` }}
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
              style={{ 
                backgroundColor,
                fontFamily,
                fontSize: `${bodySize}px`,
                fontStyle,
                fontWeight,
                textDecoration,
                textTransform
              }}
            >
              <span className="text-white font-medium">{option.text}</span>
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      );
    }) : null;
  }, [content?.options, getAspectRatioValue, handleOptionClick, fontFamily, bodySize, fontStyle, fontWeight, textDecoration, textTransform, borderRadiusValue, funnelSettings.primaryColor]);
  
  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: content?.marginTop ? `${content.marginTop}px` : undefined,
    fontFamily
  };
  
  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={containerStyle}>
        {content?.title && (
          <h2 
            className="font-semibold text-center mb-4"
            style={{
              fontSize: `${headingSize}px`,
              fontFamily,
              lineHeight: String(lineHeight),
              fontStyle,
              fontWeight,
              textDecoration,
              textTransform
            }}
          >
            {content.title}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-4">
          {renderedOptions}
        </div>
      </div>
    </BaseElementRenderer>
  );
};

export default MultipleChoiceImageRenderer;
