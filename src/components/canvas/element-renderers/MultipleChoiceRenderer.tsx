import { cn } from "@/lib/utils";
import { ElementRendererProps } from "@/types/canvasTypes";
import { useStore } from "@/utils/store";
import BaseElementRenderer from "./BaseElementRenderer";
import { useCallback, useState, useEffect } from "react";
import { accessService } from "@/services/accessService";
import { Check } from "lucide-react";

const MultipleChoiceRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  // Destructure configuration options with defaults
  const {
    allowMultipleSelection = false,
    indicatorType = "circle", // circle or square
    indicatorAlign = "left", // left or right
    indicatorColor = "#8b5cf6", // Cor padrão roxa
    indicatorIconColor = "#FFFFFF", // Cor padrão branca
    continueButtonText = "Continuar",
    helperText = "Selecione uma ou mais opções para avançar",
    showHelperText = true
  } = content || {};
  
  // Get style settings
  const style = content?.style || {};
  const marginTop = style.marginTop;
  
  // Reset selected options when element changes
  useEffect(() => {
    setSelectedOptions([]);
  }, [element.id]);
  
  // Função para executar a navegação com base na opção selecionada
  const executeNavigation = useCallback(async (optionId: string) => {
    const option = content.options.find((opt: any) => opt.id === optionId);
    if (!option) {
      console.error("Opção não encontrada:", optionId);
      return;
    }

    // Verificar se há configuração de navegação
    if (!option.navigation) {
      console.warn("Opção sem configuração de navegação:", option.text);
      return;
    }

    const navigationType = option.navigation.type;
    console.log("MultipleChoiceRenderer - executeNavigation with option:", option);
    console.log("Navigation type:", navigationType, "Navigation config:", option.navigation);

    // Se for tipo "none", não realiza navegação
    if (navigationType === "none") {
      console.log("Navegação do tipo 'none' - nenhuma ação será executada");
      return;
    }

    // Handle navigation differently based on preview mode
    if (previewMode && previewProps) {
      const { activeStep, onStepChange, funnel } = previewProps;
      console.log("Preview props:", { activeStep, funnel: funnel?.id });
      
      // Registrar a interação de clique no botão juntamente com o valor selecionado
      if (funnel) {
        // Register selected choice
        const selection = option.text || option.value;
        try {
          console.log("Registrando interação para funil:", funnel.id, "etapa:", activeStep + 1);
          await accessService.registerStepInteraction(
            funnel.id,
            activeStep + 1,
            null, // usar sessionId atual
            'choice',
            selection // Usar o texto completo da opção
          );
          
          console.log(`Interação registrada para opção: "${selection}" na etapa ${activeStep + 1}`);
        } catch (error) {
          console.error("Error registering step interaction:", error);
        }
        
        // Verificar tipo de navegação e executar ação correspondente
        try {
          if (navigationType === "next") {
            console.log("Preview mode: Navigate to next step", "Current:", activeStep, "Total:", funnel.steps.length);
            if (activeStep < funnel.steps.length - 1) {
              console.log("Navegando para a próxima etapa:", activeStep + 1);
              // Primeiro atualizar o progresso
              await accessService.updateProgress(funnel.id, activeStep + 1, null);
              // Depois mudar a etapa
              setTimeout(() => onStepChange(activeStep + 1), 100);
            } else if (activeStep === funnel.steps.length - 1) {
              // Se for o último step, marcar como conversão
              console.log("Última etapa - marcando como conversão");
              await accessService.updateProgress(funnel.id, activeStep + 1, null, true);
            }
          }
          else if (navigationType === "step" && option.navigation.stepId) {
            console.log("Preview mode: Navigate to specific step:", option.navigation.stepId);
            const stepIndex = funnel.steps.findIndex(step => step.id === option.navigation.stepId);
            console.log("Found step index:", stepIndex, "from total steps:", funnel.steps.length);
            
            if (stepIndex !== -1) {
              // Primeiro atualizar o progresso
              await accessService.updateProgress(funnel.id, stepIndex + 1, null);
              
              if (stepIndex === funnel.steps.length - 1) {
                // Se for o último step, marcar como conversão
                console.log("Última etapa (específica) - marcando como conversão");
                await accessService.updateProgress(funnel.id, stepIndex + 1, null, true);
              }
              
              // Forçar um atraso antes de mudar a etapa
              console.log("Navegando para a etapa específica:", stepIndex);
              setTimeout(() => onStepChange(stepIndex), 200);
            }
          }
          else if (navigationType === "url" && option.navigation.url) {
            console.log("Preview mode: Open external URL:", option.navigation.url);
            // Marcar como conversão antes de redirecionar
            await accessService.updateProgress(funnel.id, activeStep + 1, null, true);
            console.log("Redirecionando para URL externa");
            window.open(option.navigation.url, option.navigation.openInNewTab ? "_blank" : "_self");
          }
        } catch (error) {
          console.error("Erro durante a navegação:", error);
        }
      } else {
        console.warn("No funnel object available in preview props");
      }
    } else {
      // Handle navigation in canvas mode
      console.log("Modo Canvas - navegação simulada apenas");
      if (navigationType === "next") {
        if (currentFunnel && currentStep < currentFunnel.steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
      else if (navigationType === "step" && option.navigation.stepId) {
        if (currentFunnel) {
          const stepIndex = currentFunnel.steps.findIndex(step => step.id === option.navigation.stepId);
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
          }
        }
      }
      else if (navigationType === "url" && option.navigation.url) {
        window.open(option.navigation.url, option.navigation.openInNewTab ? "_blank" : "_self");
      }
    }
  }, [previewMode, previewProps, currentFunnel, setCurrentStep, currentStep, content?.options]);
  
  const handleOptionClick = useCallback((option: any) => {
    console.log("MultipleChoiceRenderer - Option clicked:", option, "Allow multiple:", allowMultipleSelection);
    
    if (allowMultipleSelection) {
      // Modo de seleção múltipla - apenas atualiza a seleção sem navegar
      setSelectedOptions(prev => {
        // Toggle selection
        return prev.includes(option.id) 
          ? prev.filter(id => id !== option.id) 
          : [...prev, option.id];
      });
    } else {
      // Modo de seleção única - seleciona e navega imediatamente
      console.log("Seleção única - navegando imediatamente");
      
      // Atualizar a seleção
      setSelectedOptions([option.id]);
      
      // Verificar se a opção tem configuração de navegação
      if (option.navigation) {
        console.log("Opção tem navegação configurada:", option.navigation);
        // Navegar após um pequeno delay para garantir que a UI atualize
        setTimeout(() => {
          console.log("Executando navegação para seleção única:", option.id);
          executeNavigation(option.id);
        }, 250);
      } else {
        console.warn("Opção clicada não tem configuração de navegação:", option.text);
      }
    }
  }, [allowMultipleSelection, executeNavigation]);
  
  const handleContinue = useCallback(async () => {
    // Exit if no options selected
    if (selectedOptions.length === 0) return;
    
    const selectedOptionsData = content.options.filter((opt: any) => 
      selectedOptions.includes(opt.id)
    );
    
    // Find the first selected option with navigation
    const navigationOption = selectedOptionsData.find((opt: any) => opt.navigation);
    
    if (!navigationOption) return;
    
    // Executar a navegação padrão para múltipla seleção (botão continuar)
    executeNavigation(navigationOption.id);
  }, [selectedOptions, content?.options, executeNavigation]);

  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: marginTop !== undefined ? `${marginTop}px` : undefined
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="space-y-4" style={containerStyle}>
        {content.title && (
          <h3 className="text-lg font-medium">{content.title}</h3>
        )}
        {content.description && (
          <p className="text-sm text-muted-foreground">{content.description}</p>
        )}
        
        {/* Texto auxiliar para seleção múltipla (apenas se showHelperText for true) */}
        {allowMultipleSelection && showHelperText && helperText && (
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
        
        <div className="space-y-2">
          {content.options?.map((option: any) => {
            // Prepare styles based on option configurations
            const optionStyle = option.style || {};
            const isSelected = selectedOptions.includes(option.id);
            const borderRadius = content.style?.borderRadius || 8; // Default border radius
            
            // Inline styles for the option
            const styleObject = {
              backgroundColor: isSelected ? (optionStyle.selectedBackgroundColor || "#f5f3ff") : (optionStyle.backgroundColor || ""),
              borderColor: isSelected ? (optionStyle.selectedBorderColor || "#8b5cf6") : (optionStyle.borderColor || ""),
              color: isSelected ? (optionStyle.selectedTextColor || "#4c1d95") : (optionStyle.textColor || ""),
              borderRadius: `${borderRadius}px`,
              transition: "all 0.2s ease",
            };
            
            // Prepare the indicator element (circle or square)
            const renderIndicator = () => {
              if (indicatorType === "square") {
                return (
                  <div className={cn(
                    "w-5 h-5 flex items-center justify-center border-2",
                    isSelected 
                      ? "" 
                      : "border-gray-300 bg-white"
                  )}
                  style={{ 
                    borderRadius: "4px",
                    backgroundColor: isSelected ? indicatorColor : undefined,
                    borderColor: isSelected ? indicatorColor : undefined
                  }}>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5" style={{ color: indicatorIconColor }} />
                    )}
                  </div>
                );
              } else {
                return (
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected 
                      ? "" 
                      : "border-gray-300 bg-white"
                  )}
                  style={{
                    backgroundColor: isSelected ? indicatorColor : undefined,
                    borderColor: isSelected ? indicatorColor : undefined
                  }}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: indicatorIconColor }} />
                    )}
                  </div>
                );
              }
            };
            
            return (
              <div
                key={option.id}
                className={cn(
                  "p-4 border cursor-pointer transition-all duration-200",
                  isSelected && "border-violet-500"
                )}
                style={{
                  ...styleObject,
                  borderColor: isSelected ? indicatorColor : styleObject.borderColor
                }}
                onClick={() => handleOptionClick(option)}
              >
                <div className="flex items-center gap-3">
                  {/* Posicionamento condicional do indicador */}
                  {indicatorAlign === "left" && renderIndicator()}
                  
                  <div className="flex-1 flex items-center">
                    {option.emoji && (
                      <span className="mr-2 text-xl">{option.emoji}</span>
                    )}
                    <div>
                      <span className="font-medium">{option.text}</span>
                      {option.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Indicador à direita quando configurado */}
                  {indicatorAlign === "right" && renderIndicator()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Botão de continuar para seleção múltipla - mostrado apenas quando múltipla seleção estiver ativada */}
        {allowMultipleSelection && (
          <button 
            className={cn(
              "w-full mt-4 py-3 px-4 rounded-lg font-medium transition-all",
              selectedOptions.length > 0 
                ? "cursor-pointer opacity-100" 
                : "opacity-50 cursor-not-allowed"
            )}
            style={{
              backgroundColor: selectedOptions.length > 0 ? indicatorColor : "#f5f5f5", 
              color: selectedOptions.length > 0 ? "white" : "#a0a0a0"
            }}
            onClick={handleContinue}
            disabled={selectedOptions.length === 0}
          >
            {continueButtonText}
          </button>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default MultipleChoiceRenderer;
