import { cn } from "@/lib/utils";
import { ElementRendererProps } from "@/types/canvasTypes";
import { useStore } from "@/utils/store";
import BaseElementRenderer from "./BaseElementRenderer";
import { useCallback, useState, useEffect } from "react";
import { accessService } from "@/services/accessService";
import { Check } from "lucide-react";
import { useFormValidation } from "@/utils/FormValidationContext";

const MultipleChoiceRenderer = (props: ElementRendererProps) => {
  const { element } = props;
  const { content, previewMode, previewProps } = element;
  const { setCurrentStep, currentFunnel, currentStep } = useStore();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isProcessingInteraction, setIsProcessingInteraction] = useState(false);
  
  // Adicionar estado para capturar dados do formulário
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  
  // Obter configurações globais do funil, se disponíveis
  const funnelSettings = element.previewProps?.funnel?.settings || {};
  
  // Destructure configuration options with defaults
  const {
    allowMultipleSelection = false,
    indicatorType = "circle", // circle or square
    indicatorAlign = "left", // left or right
    indicatorColor = funnelSettings.primaryColor || "#8b5cf6", // Cor primária do funil ou padrão roxa
    indicatorIconColor = "#FFFFFF", // Cor padrão branca
    continueButtonText = "Continuar",
    helperText = "Selecione uma ou mais opções para avançar",
    showHelperText = true,
    showIndicators = true, // Nova opção para controlar visibilidade dos indicadores
    showEmojis = true // Garantir que showEmojis seja considerado (adicionado explicitamente)
  } = content || {};
  
  // Get style settings
  const style = content?.style || {};
  const marginTop = style.marginTop;
  
  // Obter configurações de fonte específicas do elemento ou usar valores padrão
  const fontFamily = style.fontFamily || funnelSettings.fontFamily || 'Inter';
  const titleFontSize = style.titleFontSize || 20;
  const optionFontSize = style.optionFontSize || 16;
  const descriptionFontSize = style.descriptionFontSize || 14;
  
  // Obter configuração de negrito para opções
  const optionsBold = style.optionsBold || false;
  
  // Obter configurações de estilo das opções
  const optionsStyle = style.optionsStyle || 'flat';
  
  // Get border radius configuration
  const borderRadiusRaw = style.borderRadius !== undefined ? style.borderRadius : (funnelSettings.borderRadius || 8);
  const borderRadiusValue = typeof borderRadiusRaw === 'string' ? parseInt(borderRadiusRaw) : borderRadiusRaw;
  
  // Adicionar o acesso ao contexto de validação
  const { validateAndNavigate } = useFormValidation();
  
  // Obter os valores do formulário na página
  useEffect(() => {
    if (!previewMode || !previewProps?.funnel) return;
    
    // Buscar todos os inputs visíveis na página
    const captureInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    
    // Monitorar mudanças nesses campos
    const handleInputChange = () => {
      const updatedFormFields: Record<string, string> = {};
      
      captureInputs.forEach((input: HTMLInputElement) => {
        // Se o input tiver um valor, associar ao tipo de campo
        if (input.value.trim()) {
          // Identificar o tipo de campo pelo placeholder ou atributos
          let fieldType = 'text';
          if (input.type === 'email') fieldType = 'email';
          if (input.type === 'tel') fieldType = 'phone';
          
          // Tentar identificar pelo placeholder
          const placeholder = input.placeholder.toLowerCase();
          if (placeholder.includes('email')) fieldType = 'email';
          if (placeholder.includes('telefone') || placeholder.includes('whatsapp') || placeholder.includes('celular')) fieldType = 'phone';
          if (placeholder.includes('nome')) fieldType = 'name';
          
          updatedFormFields[fieldType] = input.value;
        }
      });
      
      setFormFields(updatedFormFields);
    };
    
    // Adicionar event listeners para todos os inputs
    captureInputs.forEach(input => {
      input.addEventListener('input', handleInputChange);
      // Capturar valores iniciais
      if ((input as HTMLInputElement).value) {
        handleInputChange();
      }
    });
    
    // Cleanup
    return () => {
      captureInputs.forEach(input => {
        input.removeEventListener('input', handleInputChange);
      });
    };
  }, [previewMode, previewProps]);
  
  // Atualizar a função executeNavigation para usar o validateAndNavigate
  const executeNavigation = useCallback((selectedOptionId: string) => {
    console.log("MultipleChoiceRenderer - executeNavigation para opção:", selectedOptionId);
    
    if (!selectedOptionId) return;
    
    const selectedOption = content?.options?.find((opt: any) => opt.id === selectedOptionId);
    if (!selectedOption) return;
    
    // Executar navegação apenas no modo de preview
    if (previewMode && previewProps) {
      const { activeStep, onStepChange, funnel } = previewProps;
      
      if (funnel) {
        // Se a opção selecionada tiver configuração de navegação, usar ela
        if (selectedOption.navigation) {
          switch (selectedOption.navigation.type) {
            case "next":
              if (activeStep < funnel.steps.length - 1) {
                validateAndNavigate(activeStep, activeStep + 1, onStepChange);
              }
              break;
            case "step":
              if (selectedOption.navigation.stepId) {
                const stepIndex = funnel.steps.findIndex(step => step.id === selectedOption.navigation.stepId);
                if (stepIndex !== -1) {
                  validateAndNavigate(activeStep, stepIndex, onStepChange);
                }
              }
              break;
            case "url":
              if (selectedOption.navigation.url) {
                // Para URLs externas, vamos certificar que passou pela validação
                if (validateAndNavigate(activeStep, activeStep, onStepChange, { skipValidation: true })) {
                  window.open(selectedOption.navigation.url, "_blank");
                }
              }
              break;
          }
        } else {
          // Se não tiver configuração específica, ir para o próximo passo por padrão
          if (activeStep < funnel.steps.length - 1) {
            validateAndNavigate(activeStep, activeStep + 1, onStepChange);
          }
        }
        
        // Registrar interação
        try {
          const interactionValue = selectedOption.text || selectedOption.value || "Opção";
          accessService.registerStepInteraction(
            funnel.id,
            Number(activeStep + 1),
            null,
            'choice',
            interactionValue,
            `choice-option-${selectedOption.id}`
          ).catch(error => {
            console.error("Erro ao registrar interação de escolha:", error);
          });
        } catch (error) {
          console.error("Erro ao registrar interação:", error);
        }
      }
    } else {
      // No modo de canvas, usar a navegação simples
      if (currentFunnel) {
        if (selectedOption.navigation) {
          switch (selectedOption.navigation.type) {
            case "next":
              if (currentStep < currentFunnel.steps.length - 1) {
                setCurrentStep(currentStep + 1);
              }
              break;
            case "step":
              if (selectedOption.navigation.stepId) {
                const stepIndex = currentFunnel.steps.findIndex(step => step.id === selectedOption.navigation.stepId);
                if (stepIndex !== -1) {
                  setCurrentStep(stepIndex);
                }
              }
              break;
            case "url":
              // No modo de canvas, apenas logar a tentativa de navegação
              console.log("Tentativa de navegação para URL:", selectedOption.navigation.url);
              break;
          }
        } else {
          // Ir para o próximo passo por padrão
          if (currentStep < currentFunnel.steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
        }
      }
    }
  }, [previewMode, previewProps, content?.options, currentFunnel, currentStep, setCurrentStep, validateAndNavigate]);
  
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
        // Executar navegação diretamente - vamos remover o timeout pois o controle de estado já impede chamadas duplicadas
        executeNavigation(option.id);
      } else {
        console.log("Opção clicada não tem navegação configurada. Criando navegação padrão para próxima etapa.");
        
        // NOVA FUNCIONALIDADE: Se não houver navegação configurada em modo de seleção única,
        // criar uma navegação padrão para a próxima etapa
        
        // Criar objeto de navegação temporário diretamente no objeto option
        option.navigation = { type: "next" };
        
        // Executar navegação com a configuração padrão
        executeNavigation(option.id);
      }
    }
  }, [allowMultipleSelection, executeNavigation]);
  
  const handleContinue = useCallback(() => {
    console.log("MultipleChoiceRenderer - Continue button clicked with selections:", selectedOptions);
    
    if (selectedOptions.length === 0) {
      console.log("Nenhuma opção selecionada, ignorando");
      return;
    }
    
    // No modo de seleção múltipla, navegamos apenas quando o botão é clicado
    if (allowMultipleSelection && selectedOptions.length > 0) {
      // Obter a última opção selecionada para navegação
      const lastSelectedId = selectedOptions[selectedOptions.length - 1];
      executeNavigation(lastSelectedId);
    }
  }, [selectedOptions, allowMultipleSelection, executeNavigation]);
  
  // Definir o estilo dos indicadores
  const getIndicatorStyle = () => {
    const baseStyle = {
      width: indicatorType === 'circle' ? '24px' : '20px',
      height: indicatorType === 'circle' ? '24px' : '20px',
      backgroundColor: 'transparent',
      borderRadius: indicatorType === 'circle' ? '50%' : '4px',
      border: `2px solid ${indicatorColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    };
    
    return baseStyle;
  };
  
  // Obter o estilo para um indicador selecionado
  const getSelectedIndicatorStyle = () => {
    return {
      ...getIndicatorStyle(),
      backgroundColor: indicatorColor,
      border: `2px solid ${indicatorColor}`
    };
  };
  
  // Definir o estilo das opções com base na configuração
  const getOptionStyle = (isSelected: boolean, option: any) => {
    // Obter estilos personalizados da opção, se existirem
    const optionCustomStyle = option.style || {};
    
    // Usar cores personalizadas da opção quando disponíveis, caso contrário usar valores padrão
    const backgroundColor = isSelected 
      ? optionCustomStyle.selectedBackgroundColor || `${indicatorColor}10`
      : optionCustomStyle.backgroundColor || 'white';
    
    const borderColor = isSelected 
      ? optionCustomStyle.selectedBorderColor || indicatorColor 
      : optionCustomStyle.borderColor || '#e2e8f0';
    
    const textColor = isSelected
      ? optionCustomStyle.selectedTextColor || 'inherit'
      : optionCustomStyle.textColor || 'inherit';

    let optionStyle: React.CSSProperties = {
      border: `1px solid ${borderColor}`,
      borderRadius: `${borderRadiusValue}px`,
      padding: '10px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: indicatorAlign === 'left' ? 'flex-start' : 'space-between',
      gap: '12px',
      backgroundColor,
      color: textColor,
      fontFamily: formatFontFamily(fontFamily),
      fontSize: `${optionFontSize}px`,
      fontWeight: optionsBold ? 'bold' : 'normal'
    };
    
    // Aplicar estilos adicionais com base no estilo de opção
    switch (optionsStyle) {
      case '3d':
        optionStyle = {
          ...optionStyle,
          boxShadow: isSelected ? `0 4px 6px -1px ${indicatorColor}40` : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: isSelected ? 'translateY(-2px)' : 'none'
        };
        break;
      case 'neumorphism':
        optionStyle = {
          ...optionStyle,
          backgroundColor: backgroundColor !== 'white' ? backgroundColor : '#f0f0f0',
          boxShadow: isSelected
            ? `inset 3px 3px 6px rgba(0,0,0,0.2), inset -3px -3px 6px rgba(255,255,255,0.7), 0 0 0 2px ${borderColor}`
            : '3px 3px 6px rgba(0,0,0,0.2), -3px -3px 6px rgba(255,255,255,0.7)',
          border: 'none'
        };
        break;
      case 'glassmorphism':
        optionStyle = {
          ...optionStyle,
          backgroundColor: isSelected ? `${indicatorColor}20` : 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(7px)',
          border: isSelected ? `1px solid ${borderColor}60` : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        };
        break;
    }
    
    return optionStyle;
  };
  
  // Função auxiliar para formatar nome de fonte
  const formatFontFamily = (font: string) => {
    return font.includes(' ') && !font.includes(',') && !font.includes('"') ? `"${font}"` : font;
  };
  
  // Calcular o estilo para margem superior
  const containerStyle = {
    marginTop: marginTop !== undefined ? `${marginTop}px` : undefined,
    fontFamily: formatFontFamily(fontFamily)
  };

  return (
    <BaseElementRenderer {...props}>
      <div className="p-4" style={containerStyle}>
        {content?.title && (
          <h2 
            className={cn(
              "font-medium mb-4",
              style.titleAlignment === "center" ? "text-center" : 
              style.titleAlignment === "right" ? "text-right" : "text-left"
            )}
            style={{
              fontSize: `${titleFontSize}px`,
              fontFamily: formatFontFamily(fontFamily)
            }}
          >
            {content.title}
          </h2>
        )}
        
        {content?.description && (
          <p 
            className={cn(
              "mb-4 text-muted-foreground",
              style.titleAlignment === "center" ? "text-center" : 
              style.titleAlignment === "right" ? "text-right" : "text-left"
            )}
            style={{
              fontSize: `${descriptionFontSize}px`,
              fontFamily: formatFontFamily(fontFamily)
            }}
          >
            {content.description}
          </p>
        )}
        
        <div className="space-y-3">
          {content?.options?.map((option: any) => {
            const isSelected = selectedOptions.includes(option.id);
            const shouldShowIndicator = showIndicators;
            
            // Obter o estilo personalizado da opção
            const optionStyle = getOptionStyle(isSelected, option);
            
            return (
              <div
                key={option.id}
                style={optionStyle}
                className="group"
                onClick={() => handleOptionClick(option)}
                role="button"
                tabIndex={0}
              >
                {/* Indicador à esquerda */}
                {shouldShowIndicator && indicatorAlign === 'left' && (
                  <div style={isSelected ? getSelectedIndicatorStyle() : getIndicatorStyle()}>
                    {isSelected && <Check className="h-3 w-3" style={{ color: indicatorIconColor }} />}
                  </div>
                )}
                
                <span className="flex-1 flex items-center">
                  {showEmojis && option.emoji && (
                    <span className="mr-2 text-3xl font-apple-emoji">{option.emoji}</span>
                  )}
                  {option.text}
                </span>
                
                {/* Indicador à direita */}
                {shouldShowIndicator && indicatorAlign === 'right' && (
                  <div style={isSelected ? getSelectedIndicatorStyle() : getIndicatorStyle()}>
                    {isSelected && <Check className="h-3 w-3" style={{ color: indicatorIconColor }} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Estilo para garantir que os emojis sejam exibidos corretamente */}
        <style dangerouslySetInnerHTML={{ __html: `
          .font-apple-emoji {
            font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
          }
        `}} />
        
        {showHelperText && allowMultipleSelection && (
          <p 
            className="mt-2 text-sm text-muted-foreground"
            style={{
              fontSize: `${descriptionFontSize}px`,
              fontFamily: formatFontFamily(fontFamily)
            }}
          >
            {helperText}
          </p>
        )}
        
        {allowMultipleSelection && (
          <button 
            className={cn(
              "w-full mt-4 py-3 px-4 font-medium transition-all",
              selectedOptions.length > 0 
                ? "cursor-pointer opacity-100" 
                : "opacity-50 cursor-not-allowed",
              isProcessingInteraction && "opacity-70 cursor-wait"
            )}
            style={{
              backgroundColor: selectedOptions.length > 0 ? indicatorColor : "#f5f5f5", 
              color: selectedOptions.length > 0 ? "white" : "#a0a0a0",
              borderRadius: `${borderRadiusValue}px`,
              fontFamily: formatFontFamily(fontFamily),
              fontSize: `${optionFontSize}px`
            }}
            onClick={handleContinue}
            disabled={selectedOptions.length === 0 || isProcessingInteraction}
          >
            {isProcessingInteraction ? "Processando..." : continueButtonText}
          </button>
        )}
      </div>
    </BaseElementRenderer>
  );
};

export default MultipleChoiceRenderer;
